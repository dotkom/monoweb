import { type Database } from "@dotkomonline/db";
import { EventSchema, type Event, type EventWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";
import { paginateQuery, type Cursor } from "../../utils/db-utils";

export const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data);

export interface EventRepository {
    create(data: EventWrite): Promise<Event | undefined>;
    update(id: Event["id"], data: Omit<EventWrite, "id">): Promise<Event>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Event>>;
    getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Array<Event>>;
    getById(id: string): Promise<Event | undefined>;
}

export class EventRepositoryImpl implements EventRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(data: EventWrite): Promise<Event | undefined> {
        const event = await this.db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow();

        return mapToEvent(event);
    }

    public async update(id: Event["id"], data: Omit<EventWrite, "id">): Promise<Event> {
        const event = await this.db
            .updateTable("event")
            .set(data)
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToEvent(event);
    }

    public async getAll(take: number, cursor?: Cursor): Promise<Array<Event>> {
        let query = this.db.selectFrom("event").selectAll().limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const events = await query.execute();

        return events.map(mapToEvent);
    }

    public async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Array<Event>> {
        let query = this.db.selectFrom("event").selectAll().where("committeeId", "=", committeeId).limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const events = await query.execute();

        return events.map(mapToEvent);
    }

    public async getById(id: string): Promise<Event | undefined> {
        const event = await this.db.selectFrom("event").selectAll().where("id", "=", id).executeTakeFirst();

        return event ? mapToEvent(event) : undefined;
    }
}
