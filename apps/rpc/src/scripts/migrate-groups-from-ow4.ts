import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { exit } from "node:process"
import { Command } from "commander"
import { marked } from "marked"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

async function dumpData() {
  const PAGE_LIMIT = 20
  async function dumpGroups() {
    // Sanity configuration
    const result = []
    let page = 1
    const getGroupUrl = (page: number) =>
      `https://old.online.ntnu.no/api/v1/group/online-groups/?format=json&page=${page}`

    while (true) {
      const response = await fetch(getGroupUrl(page))
      const data = await response.json()
      page++
      result.push(...data.results)

      if (page > PAGE_LIMIT) {
        console.error("Page limit reached in dumpGroups")
        exit(1)
      }

      if (data.next === null) {
        break
      }
    }

    return result
  }

  async function dumpHobbys() {
    const result = []
    let page = 1
    const getHobbyUrl = (page: number) => `https://old.online.ntnu.no/api/v1/hobbys/?format=json&page=${page}`

    while (true) {
      const response = await fetch(getHobbyUrl(page))
      const data = await response.json()
      page++
      result.push(...data.results)

      if (page > PAGE_LIMIT) {
        console.error("Page limit reached in dumpHobbys")
        exit(1)
      }

      if (data.next === null) {
        break
      }
    }
    return result
  }

  const groups = await dumpGroups()
  const hobbies = await dumpHobbys()

  const pathOfThisScript = import.meta.dirname
  fs.writeFileSync(path.resolve(pathOfThisScript, "./groups.json"), JSON.stringify(groups, null, 2))
  fs.writeFileSync(path.resolve(pathOfThisScript, "./hobbys.json"), JSON.stringify(hobbies, null, 2))
}

import { TZDate } from "@date-fns/tz"
import type { DBClient, Prisma } from "@dotkomonline/db"
import { type GroupId, type GroupRoleWrite, getDefaultGroupMemberRoles } from "@dotkomonline/types"
import { slugify } from "@dotkomonline/utils"
import z from "zod"
import { configuration } from "../configuration"
import { createServiceLayer, createThirdPartyClients } from "../modules/core"

type OW4GroupMembership = z.infer<typeof OW4GroupMembershipSchema>
const OW4GroupMembershipSchema = z.object({
  added: z.string().transform((data) => new TZDate(data, "UTC")),
  group_id: z.number(),
  auth0_subject: z.string(),
  roles: z.string().array(),
})

// Copied from group-service.ts
const createIdFromGroupName = async (prisma: DBClient, name: string) => {
  let id = slugify(name)
  for (let i = 1; ; i++) {
    const match = await prisma.group.findUnique({ where: { slug: id } })
    if (match === null) {
      break
    }
    // If the id already exists, we try something like slug-1
    id = `${slugify(name)}-${i}`
  }
  return id
}

const getOW4RoleDisplayname = (roleType: string): string => {
  switch (roleType) {
    case "leader":
      return "Leder"
    case "board_member":
      return "Styremedlem"
    case "deputy_leader":
      return "Nestleder"
    case "treasurer":
      return "Økonomiansvarlig"
    case "chief_editor":
      return "Redaktør"
    case "wine_penalty_manager":
      return "Vinstraffansvarlig"
    default:
      throw new Error(`Unknown ow4 role type ${roleType}`)
  }
}

const insertGroupMembers = async (prisma: DBClient, groupId: GroupId, groupMemberships: OW4GroupMembership[]) => {
  let groupRoles = await prisma.groupRole.findMany({ where: { groupId } })
  const rolesToCreate: GroupRoleWrite[] = groupMemberships
    .flatMap((membership) => membership.roles)
    .filter((role) => !groupRoles.some((existingRole) => existingRole.name === role))
    .map((role) => ({ groupId, type: "COSMETIC", name: getOW4RoleDisplayname(role) }))

  const newRoles = await prisma.groupRole.createManyAndReturn({ data: rolesToCreate, skipDuplicates: true })
  groupRoles = [...groupRoles, ...newRoles]

  for (const membership of groupMemberships) {
    const user = await prisma.user.findUnique({ where: { id: membership.auth0_subject } })
    if (user === null) {
      console.error(`User with id ${membership.auth0_subject} does not exist`)
      continue
    }

    const roleNames = membership.roles.map(getOW4RoleDisplayname)
    if (roleNames.length === 0) roleNames.push("Medlem")

    const roles = groupRoles.filter((role) => roleNames.includes(role.name))
    await prisma.groupMembership.create({
      data: {
        start: membership.added,
        end: null,
        groupId,
        userId: membership.auth0_subject,
        roles: {
          createMany: {
            data: Array.from(roles).map((role) => ({ roleId: role.id })),
          },
        },
      },
    })
  }
}

async function insertDump() {
  const pathOfThisScript = import.meta.dirname
  // biome-ignore lint/suspicious/noExplicitAny: files don't exist and cannot provide types until they are created
  const groups = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./groups.json"), "utf-8")) as any[]
  // biome-ignore lint/suspicious/noExplicitAny: files don't exist and cannot provide types until they are created
  const hobbies = JSON.parse(await fsp.readFile(path.resolve(pathOfThisScript, "./hobbys.json"), "utf-8")) as any[]

  /**
   * Export result from query under to file ./group-memberships.json
   * 
  SELECT
    json_agg(member_json)
  FROM
  (
    SELECT
      json_build_object(
        'added',
        member.added,
        'group_id',
        member.group_id,
        'auth0_subject',
        onlineuser.auth0_subject,
        'roles',
        COALESCE(
          jsonb_agg(role.role_type) FILTER (
            WHERE
              role.role_type IS NOT NULL
          ),
          '[]'::jsonb
        )
      ) AS member_json
    FROM
      authentication_groupmember AS member
      LEFT JOIN authentication_onlineuser AS onlineuser ON onlineuser.id = member.user_id
      LEFT JOIN authentication_grouprole_memberships AS rolemembership ON rolemembership.groupmember_id = member.id
      LEFT JOIN authentication_grouprole AS role ON role.id = rolemembership.grouprole_id
    GROUP BY
      member.added,
      member.group_id,
      onlineuser.auth0_subject
  ) AS sub;
   */
  const rawGroupMemberships = JSON.parse(
    await fsp.readFile(path.resolve(pathOfThisScript, "./group-memberships.json"), "utf-8")
  )
  const groupMemberships = OW4GroupMembershipSchema.array().parse(rawGroupMemberships)

  const committees = groups.filter((item) => item.group_type === "committee")
  const nodeCommittees = groups.filter((item) => item.group_type === "node_committee")
  const interestGroups = hobbies
  const other = groups.filter((item) => item.group_type === "other")

  console.log("\nCOMMITEES: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  committees.forEach((item) => console.log(item.name_short))

  console.log("\nNODE COMMITTEES: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  nodeCommittees.forEach((item) => console.log(item.name_short))

  console.log("\nOTHER: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  other.forEach((item) => console.log(item.name_short))

  console.log("\nINTEREST GROUPS: ")
  // biome-ignore lint/complexity/noForEach: <explanation>
  interestGroups.forEach((item) => console.log(item.title))

  console.log("\n\nInserting interest groups:")
  for (const item of interestGroups) {
    console.log(`Inserting ${item.title}`)
    const title = item.title.replace(" [inaktiv]", "")
    const id = await createIdFromGroupName(prisma, title)
    await prisma.group.create({
      data: {
        slug: id,
        abbreviation: title,
        about: item.description || "",
        imageUrl: item.image?.original,
        type: "INTEREST_GROUP",
      },
    })
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
  }

  console.log("\n\nInserting committees:")
  for (const item of committees) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.group.create({
      data: {
        slug: id,
        abbreviation: item.name_short,
        name: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "COMMITTEE",
      },
    })
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    insertGroupMembers(
      prisma,
      id,
      groupMemberships.filter((groupMembership) => groupMembership.group_id === item.id)
    )
  }

  console.log("\n\nInserting node committees:")
  for (const item of nodeCommittees) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.group.create({
      data: {
        slug: id,
        name: item.name_short,
        abbreviation: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "NODE_COMMITTEE",
      },
    })
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    insertGroupMembers(
      prisma,
      id,
      groupMemberships.filter((groupMembership) => groupMembership.group_id === item.id)
    )
  }

  console.log("\n\nInserting other groups:")
  for (const item of other) {
    console.log(`Inserting ${item.name_short}`)
    const id = await createIdFromGroupName(prisma, item.name_short)
    await prisma.group.create({
      data: {
        slug: id,
        name: item.name_short,
        abbreviation: item.name_short,
        createdAt: item.created,
        about: item.description_long || item.application_description || "",
        description: item.description_short,
        email: item.email,
        imageUrl: item.image?.original,
        type: "ASSOCIATED",
      },
    })
    await prisma.groupRole.createMany({ data: getDefaultGroupMemberRoles(id), skipDuplicates: true })
    insertGroupMembers(
      prisma,
      id,
      groupMemberships.filter((groupMembership) => groupMembership.group_id === item.id)
    )
  }
}

const program = new Command()

program.name("migrate-groups").description("CLI tool for migrating groups from OW4")

program
  .command("1")
  .description("Dump data from OW4 to JSON files")
  .action(async () => {
    try {
      await dumpData()
      console.log("Data successfully dumped to groups.json and hobbys.json")
    } catch (error) {
      console.error("Error dumping data:", error)
      process.exit(1)
    }
  })

program
  .command("2")
  .description("Insert dumped data into the database")
  .action(async () => {
    try {
      await insertDump()
      console.log("Data successfully inserted into database")
    } catch (error) {
      console.error("Error inserting data:", error)
      process.exit(1)
    }
  })

program
  .command("3")
  .description("Delete all groups from the database")
  .action(async () => {
    try {
      await prisma.group.deleteMany()
      console.log("Successfully deleted all groups")
    } catch (error) {
      console.error("Error deleting data:", error)
      process.exit(1)
    }
  })

program
  .command("4")
  .description("Run the complete migration process (dump and insert)")
  .action(async () => {
    try {
      await dumpData()
      console.log("Data successfully dumped")
      await insertDump()
      console.log("Data successfully inserted")
    } catch (error) {
      console.error("Error during migration:", error)
      process.exit(1)
    }
  })

program
  .command("5")
  .description("Show groups in database")
  .action(async () => {
    const groups = await prisma.group.findMany()
    console.log("\nGroups: \n", groups)
  })

async function listSplashEvents() {
  const events = []

  let url = "https://old.online.ntnu.no/api/v1/splash-events/?page=2&page_size=100000"

  while (true) {
    const response = await fetch(url)
    const data = z
      .object({
        next: z.string().nullable(),
        results: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            content: z.string(),
            start_time: z.string().transform((d) => new Date(d)),
            end_time: z.string().transform((d) => new Date(d)),
          })
        ),
      })
      .parse(await response.json())

    events.push(...data.results)

    if (data.next) {
      url = data.next
    } else {
      break
    }
  }

  return events
}

program
  .command("import-velkom-events")
  .description("Import events from splash")
  .action(async () => {
    const events = await listSplashEvents()

    const newEvents: Prisma.EventCreateManyInput[] = []

    await prisma.event.deleteMany({
      where: {
        type: "WELCOME",
      },
    })

    for (const event of events) {
      if (event.start_time.getFullYear() !== 2025) {
        continue
      }

      newEvents.push({
        description: await marked(event.content),
        imageUrl: null,
        type: "WELCOME",
        status: "PUBLIC",
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        subtitle: null,
        locationTitle: null,
        locationAddress: null,
        locationLink: null,
      })
    }

    const createdEvents = await prisma.event.createManyAndReturn({ data: newEvents })
    await prisma.eventHostingGroup.createMany({
      data: createdEvents.map((createdEvent) => ({
        groupId: "velkom",
        eventId: createdEvent.id,
      })),
    })
  })

program.parse()
