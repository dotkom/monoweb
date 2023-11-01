import { type Database } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  AttendanceSchema,
  type AttendanceWrite,
  type Attendee,
  AttendeeSchema,
  type AttendeeWrite,
  type EventId,
} from "@dotkomonline/types"
import { type Kysely, sql } from "kysely"
import { type DB } from "@dotkomonline/db/src/db.generated"

export interface AttendanceRepository {
  create: (attendanceWrite: AttendanceWrite) => Promise<Attendance>
  createAttendee: (attendeeWrite: AttendeeWrite) => Promise<Attendee>
  removeAttendee: (userId: string, attendanceId: string) => Promise<Attendee>
  getAttendeeByIds: (userId: string, eventId: string) => Promise<Attendee | undefined>
  updateAttendee: (attendeeWrite: AttendeeWrite, userId: string, attendanceId: string) => Promise<Attendee>
  getByEventId: (eventId: EventId) => Promise<Attendance[]>
  getByAttendanceId(id: AttendanceId): Promise<Attendance | undefined>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(attendanceWrite: AttendanceWrite) {
    const res = await this.db
      .insertInto("attendance")
      .values({
        ...attendanceWrite,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendanceSchema.parse(res)
  }

  async createAttendee(attendeeWrite: AttendeeWrite) {
    const res = await this.db
      .insertInto("attendee")
      .values({
        userId: attendeeWrite.userId,
        attendanceId: attendeeWrite.attendanceId,
        attended: attendeeWrite.attended,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((err) => console.log(err))
    console.log({ res })
    return AttendeeSchema.parse(res)
  }

  async removeAttendee(userId: string, attendanceId: string) {
    const res = await this.db
      .deleteFrom("attendee")
      .where("userId", "=", userId)
      .where("attendanceId", "=", attendanceId)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async getAttendeeByIds(userId: string, attendanceId: string) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .where("userId", "=", userId)
      .where("attendanceId", "=", attendanceId)
      .executeTakeFirst()
    return res ? AttendeeSchema.parse(res) : undefined
  }

  async getByEventId(eventId: string) {
    const res = await this.db
      .selectFrom("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .selectAll("attendance")
      .select(
        sql<DB["attendee"][]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendance.id")
      .where("eventId", "=", eventId)
      .execute()
    return res.map((r) => AttendanceSchema.parse(r))
  }

  async updateAttendee(attendeeWrite: AttendeeWrite, userId: string, attendanceId: string) {
    const res = await this.db
      .updateTable("attendee")
      .set({ ...attendeeWrite, updatedAt: new Date() })
      .where("userId", "=", userId)
      .where("attendanceId", "=", attendanceId)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async getByAttendanceId(id: AttendanceId) {
    const res = await this.db
      .selectFrom("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .selectAll("attendance")
      .select(
        sql<DB["attendee"][]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendance.id")
      .where("id", "=", id)
      .executeTakeFirst()
    return res ? AttendanceSchema.parse(res) : undefined
  }
}
