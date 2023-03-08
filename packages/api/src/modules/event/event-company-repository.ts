import { Company, Event } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Database } from "@dotkomonline/db"
import { mapToCompany } from "../company/company-repository"
import { Cursor, paginateQuery } from "../../utils/db-utils"

export interface EventCompanyRepository {
  addCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  getCompaniesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Company[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async addCompany(id: Event["id"], company: Company["id"]) {
    await this.db
      .insertInto("eventCompany")
      .values({
        eventId: id,
        companyId: company,
      })
      .returningAll()
      .executeTakeFirst()
  }

  async deleteCompany(id: Event["id"], company: Company["id"]) {
    await this.db
      .deleteFrom("eventCompany")
      .where("companyId", "=", company)
      .where("eventId", "=", id)
      .returningAll()
      .executeTakeFirst()
  }

  async getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
    let query = this.db
      .selectFrom("eventCompany")
      .where("eventId", "=", id)
      .innerJoin("company", "company.id", "eventCompany.companyId")
      .selectAll("company")
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("createdAt", "desc").orderBy("id", "desc")
    }
    const companies = await query.execute()
    return companies.map(mapToCompany)
  }
}
