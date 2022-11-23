import { Database } from "@dotkomonline/db"
import { Company, CompanySchema } from "@dotkomonline/types"
import { Insertable, Kysely, Selectable } from "kysely"

export const mapToCompany = (payload: Selectable<Database["Company"]>): Company => {
  return CompanySchema.parse(payload)
}

export interface CompanyRepository {
  getCompanyByID: (id: string) => Promise<Company | undefined>
  getCompanies: (limit: number) => Promise<Company[]>
  create: (values: Insertable<Database["Company"]>) => Promise<Company | undefined>
}

export const initCompanyRepository = (db: Kysely<Database>): CompanyRepository => {
  const repo: CompanyRepository = {
    getCompanyByID: async (id) => {
      const company = await db.selectFrom("Company").selectAll().where("id", "=", id).executeTakeFirst()
      return company ? mapToCompany(company) : undefined
    },
    getCompanies: async (limit: number) => {
      const companies = await db.selectFrom("Company").selectAll().limit(limit).execute()
      return companies.map(mapToCompany)
    },
    create: async (companyInsert) => {
      const company = await db.insertInto("Company").values(companyInsert).returningAll().executeTakeFirst()
      return company ? mapToCompany(company) : company
    },
  }
  return repo
}
