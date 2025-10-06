import fs from "node:fs/promises"
import path from "node:path"
import { TZDate } from "@date-fns/tz"
import type { JobListingEmployment } from "@dotkomonline/types"
import { marked } from "marked"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import z from "zod"
import { createConfiguration } from "../configuration"

function getEmploymentType(employment: number): JobListingEmployment {
  switch (employment) {
    case 1:
      return "FULLTIME"
    case 2:
      return "PARTTIME"
    case 3:
      return "SUMMER_INTERNSHIP"
    default:
      return "OTHER"
  }
}

const CareerOpportunitySchema = z.object({
  title: z.string(),
  companyName: z.string(),
  ingress: z.string(),
  description: z.string(),
  start: z.string().transform((startDate) => new TZDate(startDate, "UTC")),
  end: z.string().transform((endDate) => new TZDate(endDate, "UTC")),
  featured: z.boolean(),
  deadline: z
    .string()
    .transform((deadline) => new TZDate(deadline, "UTC"))
    .nullable(),
  employment: z.number(),
  application_link: z.string().nullable(),
  application_email: z.string().nullable(),
  rolling_admission: z.boolean(),
})

/*
select
  json_agg(j)
from
  (
    select
      listing.title,
      company.name as "companyName",
      listing.ingress,
      listing.description,
      listing."start",
      listing."end",
      listing.featured,
      listing.deadline,
      listing.employment,
      NULLIF(listing.application_link, '') as application_link,
      NULLIF(listing.application_email, '') as application_email,
      listing.rolling_admission
    from
      careeropportunity_careeropportunity listing
      left join companyprofile_company company on company.id = listing.company_id
  ) as j;
*/
async function getCareerOpportunities() {
  const fpath = path.resolve(import.meta.dirname, "job_listings.json")
  const rawData = JSON.parse((await fs.readFile(fpath)).toString())
  return CareerOpportunitySchema.array().parse(rawData)
}

const configuration = createConfiguration()
const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const jobListings = await getCareerOpportunities()
const companies = await prisma.company.findMany()

for (const jobListing of jobListings) {
  const company = companies.find((company) => company.name === jobListing.companyName)

  if (!company) {
    continue
  }

  await prisma.jobListing.create({
    data: {
      title: jobListing.title,
      description: marked(jobListing.description, { async: false }),
      shortDescription: jobListing.ingress,
      employment: getEmploymentType(jobListing.employment),
      applicationLink: jobListing.application_link,
      applicationEmail: jobListing.application_email,
      rollingAdmission: jobListing.rolling_admission,
      deadline: jobListing.deadline,
      start: jobListing.start,
      end: jobListing.end,
      hidden: false,
      featured: jobListing.featured,
      company: {
        connect: {
          id: company.id,
        },
      },
    },
  })
}
