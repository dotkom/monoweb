import { type Database } from "@dotkomonline/db"
import { type Event, type EventId, EventSchema, EventExtra } from "@dotkomonline/types"
import { type Insertable, type Kysely, type Selectable } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToEvent = (data: Selectable<Database["event"]>) => EventSchema.parse(data)

export type EventInsert = Insertable<Database["event"]>

export interface EventRepository {
  createEvent(data: EventInsert): Promise<Event>
  updateEvent(id: EventId, data: EventInsert): Promise<Event>
  eventGetAll(take: number, cursor?: Cursor): Promise<Event[]>
  getEventAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  getById(id: string): Promise<Event | undefined>
  createEventExtras(eventId: EventId, extras: EventExtra[]): Promise<void>

  createPool(attendanceWrite: AttendanceWrite): Promise<Attendance>
  deletePool(id: AttendanceId): Promise<DeleteResult>

  createAttendee(attendeeWrite: AttendeeWrite): Promise<Attendee>
  updateAttendee(attendeeWrite: AttendeeWrite, userId: string, attendanceId: string): Promise<Attendee>
  deleteAttendee(userId: string, attendanceId: string): Promise<Attendee>
  getAttendeeByEvent(userId: string, eventId: string): Promise<Attendee | undefined>

  getAttendeesByEvent(eventId: EventId): Promise<Attendance[]>
  getAttendeesByPool(id: AttendanceId): Promise<Attendance | undefined>

  createAttendeeExtrasChoice(
    eventId: EventId,
    attendanceId: AttendanceId,
    questionId: string,
    choiceId: string
  ): Promise<Attendee>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: EventInsert): Promise<Event> {
    const event = await this.db.insertInto("event").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToEvent(event)
  }

  async update(id: EventId, data: EventInsert): Promise<Event> {
    const event = await this.db
      .updateTable("event")
      .set({ ...data, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToEvent(event)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Event[]> {
    const query = orderedQuery(this.db.selectFrom("event").selectAll().limit(take), cursor)
    const events = await query.execute()

    return events.map((e) => mapToEvent(e))
  }

  async getAllByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("eventCommittee")
        .where("committeeId", "=", committeeId)
        .innerJoin("event", "event.id", "eventCommittee.eventId")
        .selectAll("event")
        .limit(take),
      cursor
    )

    const events = await query.execute()
    return events.map((e) => mapToEvent(e))
  }
  async getById(id: string): Promise<Event | undefined> {
    const event = await this.db.selectFrom("event").where("id", "=", id).selectAll().executeTakeFirst()
    return event === undefined ? undefined : mapToEvent(event)
  }
}
