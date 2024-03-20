import { type Company, type CompanyId, type Event, type EventId } from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type Database } from "@dotkomonline/db"
import { mapToEvent } from "./event-repository"
import { mapToCompany } from "../company/company-repository"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export interface EventCompanyRepository {
  createCompany(id: EventId, company: CompanyId): Promise<void>
  deleteCompany(id: EventId, company: CompanyId): Promise<void>
  getCompaniesByEventId(id: EventId, take: number, cursor?: Cursor): Promise<Company[]>
  getEventsByCompanyId(id: CompanyId, take: number, cursor?: Cursor): Promise<Event[]>
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createCompany(id: EventId, company: CompanyId) {
    await this.db
      .insertInto("eventCompany")
      .values({
        eventId: id,
        companyId: company,
      })
      .onConflict((eb) => eb.columns(["eventId", "companyId"]).doNothing())
      .returningAll()
      .executeTakeFirst()
  }

  async deleteCompany(id: EventId, company: CompanyId) {
    await this.db
      .deleteFrom("eventCompany")
      .where("companyId", "=", company)
      .where("eventId", "=", id)
      .returningAll()
      .executeTakeFirst()
  }

  async getCompaniesByEventId(id: EventId, take: number, cursor?: Cursor) {
    const query = orderedQuery(
      this.db
        .selectFrom("eventCompany")
        .where("eventId", "=", id)
        .innerJoin("company", "company.id", "eventCompany.companyId")
        .selectAll("company")
        .limit(take),
      cursor
    )
    const companies = await query.execute()
    return companies.map(mapToCompany)
  }

  async getEventsByCompanyId(companyId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("event")
        .leftJoin("eventCompany", "eventCompany.eventId", "event.id")
        .selectAll("event")
        .where("eventCompany.companyId", "=", companyId)
        .limit(take),
      cursor
    )
    const events = await query.execute()
    return events.map(mapToEvent)
  }
}
