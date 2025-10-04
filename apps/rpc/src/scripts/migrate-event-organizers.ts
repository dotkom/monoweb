import fs from "node:fs/promises"
import path from "node:path"
import { createConfiguration } from "src/configuration"
import { z } from "zod"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

const EventWithOrganizersSchema = z.object({
  id: z.number(),
  group_name: z.string().nullable(),
  companies: z.string().array(),
})

/*
select
  json_agg(e)
from
  (
    select
      events_event.id,
      auth_group.name as group_name,
      COALESCE(
        (
          SELECT
            JSONB_AGG(companyprofile_company."name")
          FROM
            events_companyevent
            left join companyprofile_company on companyprofile_company.id = events_companyevent.company_id
          WHERE
            events_companyevent.event_id = events_event.id
        ),
        '[]'::jsonb
      ) AS companies
    from
      events_event
      left join auth_group on auth_group.id = events_event.organizer_id
  ) as e
*/
async function getEventOrganizers() {
  const fpath = path.resolve(import.meta.dirname, "ow4_event_organizers.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())
  return EventWithOrganizersSchema.array().parse(rawData)
}

const configuration = createConfiguration()

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const existingEvents = await prisma.event.findMany({
  include: {
    companies: {
      include: {
        company: true,
      },
    },
    hostingGroups: {
      include: {
        group: true,
      },
    },
  },
})

const companies = await prisma.company.findMany()
const groups = await prisma.group.findMany()

const eventsWithOrganizers = await getEventOrganizers()

for (const event of eventsWithOrganizers) {
  const matchingEvent = existingEvents.find((e) => e.metadataImportId === event.id)
  if (!matchingEvent) {
    continue
  }

  const groupName = event.group_name
  if (groupName) {
    const group = groups.find((g) =>
      [g.slug.toLowerCase(), g.abbreviation.toLowerCase(), g.name?.toLowerCase()].includes(groupName.toLowerCase())
    )

    if (group && !matchingEvent.hostingGroups.some((g) => g.groupId === group.slug)) {
      await prisma.eventHostingGroup.create({
        data: {
          eventId: matchingEvent.id,
          groupId: group.slug,
        },
      })
    }
  }

  if (!event.companies) {
    continue
  }

  const eventCompanies = event.companies
    .map((eventCompany) => companies.find((company) => company.name.toLowerCase() === eventCompany.toLowerCase()))
    .filter((company) => company !== undefined)

  const companiesToAdd = eventCompanies.filter(
    (company) => !matchingEvent.companies.some((eventCompany) => eventCompany.companyId === company.id)
  )

  if (companiesToAdd.length === 0) {
    continue
  }

  await prisma.eventCompany.createMany({
    data: companiesToAdd.map((company) => ({
      eventId: matchingEvent.id,
      companyId: company.id,
    })),
  })
}
