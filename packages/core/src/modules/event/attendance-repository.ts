import { type Database } from "@dotkomonline/db"
import { type DB } from "@dotkomonline/db/src/db.generated"
import {
  AttendancePoolSchema,
  AttendeeSchema,
  type AttendancePool,
  type AttendanceId,
  type AttendancePoolWrite,
  type Attendee,
  type AttendeeWrite,
  type EventId,
  AttendanceWrite,
  AttendanceSchema,
  Attendance,
} from "@dotkomonline/types"
import { type DeleteResult, sql, type Kysely } from "kysely"

export interface AttendanceRepository {
  create(attendanceWrite: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<DeleteResult>

  createPool(attendancePoolWrite: AttendancePoolWrite): Promise<AttendancePool>
  deletePool(id: AttendanceId): Promise<DeleteResult>

  createAttendee(attendeeWrite: AttendeeWrite): Promise<Attendee>
  removeAttendee(userId: string, attendanceId: string): Promise<Attendee>

  getAttendeeById(userId: string, eventId: string): Promise<Attendee | undefined>
  updateAttendee(attendeeWrite: AttendeeWrite, userId: string, attendanceId: string): Promise<Attendee>
  getPoolByEventId(eventId: EventId): Promise<AttendancePool[]>
  getPoolById(id: AttendanceId): Promise<AttendancePool | undefined>
  addChoice(eventId: EventId, attendanceId: AttendanceId, questionId: string, choiceId: string): Promise<Attendee>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(attendanceWrite: AttendanceWrite) {
    const res = await this.db
      .insertInto("attendance")
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        eventId: attendanceWrite.eventId,
        mergeTime: attendanceWrite.mergeTime,
        registerEnd: attendanceWrite.registerEnd,
        registerStart: attendanceWrite.registerStart,
        deregisterDeadline: attendanceWrite.deregisterDeadline,
      })
      .returningAll()
      .executeTakeFirstOrThrow()

    return AttendanceSchema.parse(res)
  }

  async delete(id: AttendanceId) {
    return await this.db.deleteFrom("attendance").where("id", "=", id).executeTakeFirst()
  }

  async createPool(attendancePoolWrite: AttendancePoolWrite) {
    const res = await this.db
      .insertInto("attendancePool")
      .values({
        createdAt: new Date(),
        updatedAt: new Date(),
        attendanceId: attendancePoolWrite.attendanceId,
        limit: attendancePoolWrite.limit,
        max: attendancePoolWrite.max,
        min: attendancePoolWrite.min,
        waitlist: attendancePoolWrite.waitlist,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendancePoolSchema.parse(res)
  }

  async deletePool(id: AttendanceId) {
    return await this.db.deleteFrom("attendancePool").where("id", "=", id).executeTakeFirst()
  }

  async createAttendee(attendeeWrite: AttendeeWrite) {
    const res = await this.db
      .insertInto("attendee")
      .values({
        userId: attendeeWrite.userId,
        attended: attendeeWrite.attended,
        attendancePoolId: attendeeWrite.attendancePoolId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async removeAttendee(userId: string, attendancePoolId: string) {
    const res = await this.db
      .deleteFrom("attendee")
      .where("userId", "=", userId)
      .where("attendancePoolId", "=", attendancePoolId)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async getAttendeeById(userId: string, attendancePoolId: string) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .where("userId", "=", userId)
      .where("attendancePoolId", "=", attendancePoolId)
      .executeTakeFirst()
    return res ? AttendeeSchema.parse(res) : undefined
  }

  async getPoolByEventId(eventId: string) {
    const res = await this.db
      .selectFrom("attendancePool")
      .leftJoin("attendee", "attendee.attendancePoolId", "attendancePool.id")
      .leftJoin("event", "event.id", "attendancePool.attendanceId")
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .selectAll("attendancePool")
      .select(
        sql<DB["attendee"][]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendancePool.id")
      .where("attendance.eventId", "=", eventId)
      .execute()
    return res.map((r) => AttendancePoolSchema.parse(r))
  }

  async updateAttendee(attendeeWrite: AttendeeWrite, userId: string, attendancePoolId: string) {
    const res = await this.db
      .updateTable("attendee")
      .set({ ...attendeeWrite, updatedAt: new Date() })
      .where("userId", "=", userId)
      .where("attendancePoolId", "=", attendancePoolId)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async getPoolById(id: AttendanceId) {
    const res = await this.db
      .selectFrom("attendancePool")
      .leftJoin("attendee", "attendee.attendancePoolId", "attendancePool.id")
      .selectAll("attendancePool")
      .select(
        sql<DB["attendee"][]>`COALESCE(json_agg(attendee) FILTER (WHERE attendee.id IS NOT NULL), '[]')`.as("attendees")
      )
      .groupBy("attendancePool.id")
      .where("id", "=", id)
      .executeTakeFirst()
    return res ? AttendancePoolSchema.parse(res) : undefined
  }

  async addChoice(eventId: EventId, attendanceId: AttendanceId, questionId: string, choiceId: string) {
    const res = await this.db
      .updateTable("attendee")
      .set({ extrasChoices: JSON.stringify([{ id: questionId, choice: choiceId }]) })
      .where("userId", "=", eventId)
      .where("attendancePoolId", "=", attendanceId)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }
}
