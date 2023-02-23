import { Database } from "@dotkomonline/db"
import { Company, CompanySchema, CompanyWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"

export const mapToCompany = (payload: Selectable<Database["company"]>): Company => {
  return CompanySchema.parse(payload)
}

export interface CompanyRepository {
  getCompanyByID: (id: string) => Promise<Company | undefined>
  getCompanies: (limit: number, offset?: number) => Promise<Company[]>
  create: (values: CompanyWrite) => Promise<Company | undefined>
}

export const initCompanyRepository = (db: Kysely<Database>): CompanyRepository => {
  const repo: CompanyRepository = {
    getCompanyByID: async (id) => {
      const company = await db.selectFrom("company").selectAll().where("id", "=", id).executeTakeFirst()
      return company ? mapToCompany(company) : undefined
    },
    getCompanies: async (limit: number, offset = 0) => {
      const companies = await db.selectFrom("company").selectAll().offset(offset).limit(limit).execute()
      return companies.map(mapToCompany)
    },
    create: async (val) => {
      const company = await db
        .insertInto("company")
        .values({
          name: val.name,
          description: val.description,
          email: val.email,
          website: val.website,
        })
        .returningAll()
        .executeTakeFirst()
      return company ? mapToCompany(company) : company
    },
  }
  return repo
}
