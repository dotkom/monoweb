import { type Database } from "@dotkomonline/db";
import { type Company, type Event } from "@dotkomonline/types";
import { type Kysely } from "kysely";
import { paginateQuery, type Cursor } from "../../utils/db-utils";
import { mapToCompany } from "../company/company-repository";
import { mapToEvent } from "./event-repository";

export interface EventCompanyRepository {
    createCompany(id: Event["id"], company: Company["id"]): Promise<void>;
    deleteCompany(id: Event["id"], company: Company["id"]): Promise<void>;
    getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor): Promise<Array<Company>>;
    getEventsByCompanyId(id: Company["id"], take: number, cursor?: Cursor): Promise<Array<Event>>;
}

export class EventCompanyRepositoryImpl implements EventCompanyRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async createCompany(id: Event["id"], company: Company["id"]) {
        await this.db
            .insertInto("eventCompany")
            .values({
                eventId: id,
                companyId: company,
            })
            .returningAll()
            .executeTakeFirst();
    }

    public async deleteCompany(id: Event["id"], company: Company["id"]) {
        await this.db
            .deleteFrom("eventCompany")
            .where("companyId", "=", company)
            .where("eventId", "=", id)
            .returningAll()
            .executeTakeFirst();
    }

    public async getCompaniesByEventId(id: Event["id"], take: number, cursor?: Cursor) {
        let query = this.db
            .selectFrom("eventCompany")
            .where("eventId", "=", id)
            .innerJoin("company", "company.id", "eventCompany.companyId")
            .selectAll("company")
            .limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const companies = await query.execute();

        return companies.map(mapToCompany);
    }

    public async getEventsByCompanyId(companyId: string, take: number, cursor?: Cursor): Promise<Array<Event>> {
        let query = this.db
            .selectFrom("event")
            .leftJoin("eventCompany", "eventCompany.eventId", "event.id")
            .selectAll("event")
            .where("eventCompany.companyId", "=", companyId)
            .limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const events = await query.execute();

        return events.map(mapToEvent);
    }
}
