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
  getById: (eventId: Event["id"]) => Promise<Attendance[]>
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
      })
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((err) => console.log(err))
    console.log({ res })
    return AttendeeSchema.parse(res)
  }
  async getById(eventId: string) {
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
}
