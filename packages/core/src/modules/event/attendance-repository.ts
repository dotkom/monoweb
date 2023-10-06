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
  getByEventId: (eventId: Event["id"]) => Promise<Attendance[]>
  getByAttendanceId(id: Attendance["id"]): Promise<Attendance | undefined>
  registerAttendance(eventId: Event["id"], userId: Attendee["userId"], attended: boolean): Promise<Attendee>
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

  async registerAttendance(eventId: Event["id"], userId: Attendee["userId"], attended: boolean) {
    //an attendee has a userId and an attendanceId. attendance has an eventId. attendee.attendanceId = attendance.id and attendee.userId = user.id and attendance.eventId = event.id
    const attendance = await this.getByEventId(eventId)
    const attendanceId = attendance[0].id
    const user = await this.db
      .selectFrom("owUser")
      .selectAll()
      .where("cognitoSub", "=", userId)
      .executeTakeFirstOrThrow()

    const res = await this.db
      .updateTable("attendee")
      .set({
        attended: attended,
      })
      .where("attendanceId", "=", attendanceId)
      .where("userId", "=", user.id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return AttendeeSchema.parse(res)
  }

  async createAttendee(attendeeWrite: AttendeeWrite) {
    const res = await this.db
      .insertInto("attendee")
      .values({
        userId: attendeeWrite.userId,
        attendanceId: attendeeWrite.attendanceId,
        attended: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
      .catch((err) => console.log(err))
    console.log({ res })
    return AttendeeSchema.parse(res)
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
