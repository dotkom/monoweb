import { slugify } from "@dotkomonline/utils"
import { configuration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"
import z from "zod"
import { dumpOW4Data } from "./migrate-from-ow4.ts"

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

const CompanySchema = z.object({
  name: z.string(),
  site: z.string(),
  image: z.object({
    original: z.string(),
  }),
  long_description: z.string(),
  email_address: z.string().nullable(),
  phone_number: z.string().nullable(),
})

const companies = z
  .array(CompanySchema)
  .parse(await dumpOW4Data("https://old.online.ntnu.no/api/v1/companies/?format=json&page_size=1000"))
const notDuplicated = []

const existing = new Set<string>()
for (const company of companies) {
  if (existing.has(company.name)) {
    continue
  }
  notDuplicated.push(company)
  existing.add(company.name)
}

await prisma.company.createMany({
  data: notDuplicated.map((company) => ({
    name: company.name,
    slug: slugify(company.name),
    description: company.long_description,
    phone: company.phone_number,
    email: company.email_address,
    website: company.site,
    imageUrl: company.image.original,
  })),
})

console.log(companies.length)
