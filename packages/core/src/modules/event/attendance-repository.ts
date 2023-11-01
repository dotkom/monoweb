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
import { DB } from "@dotkomonline/db/src/db.generated"

export interface AttendanceRepository {
  create: (attendanceWrite: AttendanceWrite) => Promise<Attendance>
  createAttendee: (attendeeWrite: AttendeeWrite) => Promise<Attendee>
  getAttendeeByIds: (userId: string, eventId: string) => Promise<Attendee | undefined>
  getAttendeeByUserId: (userId: string) => Promise<Attendee[] | undefined>
  getByUserId: (userId: string) => Promise<Attendance[]>
  updateAttendee: (attendeeWrite: AttendeeWrite, userId: string, attendanceId: string) => Promise<Attendee>
  getByEventId: (eventId: Event["id"]) => Promise<Attendance[]>
  getByAttendanceId(id: Attendance["id"]): Promise<Attendance | undefined>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) { }

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

  async getAttendeeByIds(userId: string, attendanceId: string) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .where("userId", "=", userId)
      .where("attendanceId", "=", attendanceId)
      .executeTakeFirst()
    return res ? AttendeeSchema.parse(res) : undefined
  }

  async getAttendeeByUserId(userId: string) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .where("userId", "=", userId)
      .execute()
    return res ? res.map((r) => AttendeeSchema.parse(r)) : undefined
  }

  async getByUserId(userId: string) {
    const res = await this.db
      .selectFrom("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .selectAll("attendance")
      .select(
        sql<DB["attendee"][]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.userId IS NOT NULL), '[]')`.as("attendees")
      )
      .where("attendee.userId", "=", userId)
      .groupBy("attendance.id")
      .execute()
    return res ? res.map((r) => AttendanceSchema.parse(r)) : []
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
    return res ? res.map((r) => AttendanceSchema.parse(r)) : []
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

  async getByAttendanceId(id: Attendance["id"]) {
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
