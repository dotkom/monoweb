import { Company, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Database } from "@dotkomonline/db"
import { mapToCompany } from "../company/company-repository"
export interface EventCompanyRepository {
  addCompany: (id: Event["id"], company: Company["id"]) => Promise<Company[] | undefined>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<Company[] | undefined>
  getCompaniesByEventId: (id: Event["id"]) => Promise<Company[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async addCompany(id: Event["id"], company: Company["id"]) {
    const link = await this.db
      .insertInto("eventCompany")
      .values({
        eventId: id,
        companyId: company,
      })
      .returningAll()
      .executeTakeFirst()
    return link ? this.getCompaniesByEventId(link.companyId) : undefined
  }

  async deleteCompany(id: Event["id"], company: Company["id"]) {
    const link = await this.db
      .deleteFrom("eventCompany")
      .where("companyId", "=", company)
      .where("eventId", "=", id)
      .returningAll()
      .executeTakeFirst()
    return link ? this.getCompaniesByEventId(link.companyId) : undefined
  }

  async getCompaniesByEventId(id: Event["id"]) {
    const companies = await this.db
      .selectFrom("eventCompany")
      .where("eventId", "=", id)
      .innerJoin("company", "company.id", "eventCompany.companyId")
      .selectAll("company")
      .execute()
    return companies.map(mapToCompany)
  }
}
