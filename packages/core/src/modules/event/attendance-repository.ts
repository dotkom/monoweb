import { Database } from "@dotkomonline/db"
import {
  Attendance,
  AttendanceSchema,
  AttendanceWrite,
  Attendee,
  AttendeeSchema,
  AttendeeWrite,
  Event,
} from "@dotkomonline/types"
import { Kysely, sql } from "kysely"
import { AttendeeTable } from "@dotkomonline/db/src/types/event"

export interface AttendanceRepository {
  create: (attendanceWrite: AttendanceWrite) => Promise<Attendance>
  createAttendee: (attendeeWrite: AttendeeWrite) => Promise<Attendee>
  getAttendeeById: (userId: string) => Promise<Attendee>
  updateAttendee: (attendeeWrite: AttendeeWrite, userId: string) => Promise<Attendee>
  getByEventId: (eventId: Event["id"]) => Promise<Attendance[]>
  getByAttendanceId(id: Attendance["id"]): Promise<Attendance | undefined>
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

  async getAttendeeById(userId: string) {
    const res = await this.db.selectFrom("attendee").where("userId", "=", userId).executeTakeFirst()
    return AttendeeSchema.parse(res)
  }

  async getByEventId(eventId: string) {
    const res = await this.db
      .selectFrom("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .selectAll("attendance")
      .select(
        sql<AttendeeTable[]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendance.id")
      .where("eventId", "=", eventId)
      .execute()
    return res ? res.map((r) => AttendanceSchema.parse(r)) : []
  }

  async updateAttendee(attendeeWrite: AttendeeWrite, userId: string) {
    const res = await this.db
      .updateTable("attendee")
      .set({ ...attendeeWrite, updatedAt: new Date() })
      .where("id", "=", userId)
      .returningAll()
      .executeTakeFirst()
    return AttendeeSchema.parse(res)
  }

  async getByAttendanceId(id: Attendance["id"]) {
    const res = await this.db
      .selectFrom("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .selectAll("attendance")
      .select(
        sql<AttendeeTable[]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendance.id")
      .where("id", "=", id)
      .executeTakeFirst()
    return res ? AttendanceSchema.parse(res) : undefined
  }
}
