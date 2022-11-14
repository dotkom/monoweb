import { Database } from "@dotkomonline/db"
import { Insertable, Kysely } from "kysely"

import { InsertCompany, mapToCompany, Company } from "./company"

export interface CompanyRepository {
  getCompanyByID: (id: string) => Promise<Company | undefined>
  getCompanies: (limit: number) => Promise<Company[]>
  create: (values: Insertable<Database["company"]>) => Promise<Company | undefined>
}

export const initCompanyRepository = (db: Kysely<Database>): CompanyRepository => {
  const repo: CompanyRepository = {
    getCompanyByID: async (id) => {
      const company = await db.selectFrom("company").selectAll().where("id", "=", id).executeTakeFirst()
      return company ? mapToCompany(company) : undefined
    },
    getCompanies: async (limit: number) => {
      const companies = await db.selectFrom("company").selectAll().limit(limit).execute()
      return companies.map(mapToCompany)
    },
    create: async (companyInsert) => {
      const company = await db.insertInto("company").values(companyInsert).returningAll().executeTakeFirst()
      return company ? mapToCompany(company) : company
    },
  }
  return repo
}
