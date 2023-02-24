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
import { Kysely } from "kysely"

export interface AttendanceRepository {
  createAttendance: (attendanceWrite: AttendanceWrite) => Promise<Attendance>
  createAttendee: (attendeeWrite: AttendeeWrite) => Promise<Attendee>
  getAttendancesByEventId: (eventId: Event["id"]) => Promise<Attendance[]>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async createAttendance(attendanceWrite: AttendanceWrite) {
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
      .executeTakeFirst()
    return AttendeeSchema.parse(res)
  }
  async getAttendancesByEventId(eventId: string) {
    const res = await this.db.selectFrom("attendance").selectAll().where("eventId", "=", eventId).execute()
    return res ? res.map((r) => AttendanceSchema.parse(r)) : []
  }
}
