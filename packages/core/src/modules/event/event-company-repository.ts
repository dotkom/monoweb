import { Company, Event, EventSchema } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { Database } from "@dotkomonline/db"
import { mapToCompany } from "../company/company-repository"
import { Cursor, paginateQuery } from "../../utils/db-utils"

export interface EventCompanyRepository {
  createCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  deleteCompany: (id: Event["id"], company: Company["id"]) => Promise<void>
  getCompaniesByEventId: (id: Event["id"], take: number, cursor?: Cursor) => Promise<Company[]>
  getEventsByCompanyId: (id: Company["id"], take: number, cursor?: Cursor) => Promise<Event[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createCompany(id: Event["id"], company: Company["id"]) {
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
      query = query.orderBy("id", "desc")
    }
    const companies = await query.execute()
    return companies.map(mapToCompany)
  }

  async getEventsByCompanyId(companyId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    let query = this.db
      .selectFrom("event")
      .leftJoin("eventCompany", "eventCompany.eventId", "event.id")
      .selectAll("event")
      .where("eventCompany.companyId", "=", companyId)
      .limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }
    const events = await query.execute()
    return events.map((e) => EventSchema.parse(e))
  }
}
