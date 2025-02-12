import type { Database } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  AttendeeSchema,
  type AttendeeWrite,
  type ExtrasChoices,
  type UserId,
} from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { withInsertJsonValue } from "../../query"

const mapToAttendee = (payload: Selectable<Database["attendee"]>): Attendee => AttendeeSchema.parse(payload)

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee | null>
  getById(id: AttendeeId): Promise<Attendee | null>
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<Attendee | null>
  updateExtraChoices(id: AttendeeId, choices: ExtrasChoices): Promise<Attendee | null>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("attendancePool", "attendancePool.id", "attendee.attendancePoolId")
      .where("userId", "=", userId)
      .where("attendancePool.attendanceId", "=", attendanceId)
      .executeTakeFirst()

    return res ? mapToAttendee(res) : null
  }

  async create(obj: AttendeeWrite): Promise<Attendee> {
    return mapToAttendee(
      await this.db
        .insertInto("attendee")
        .values(withInsertJsonValue(obj, "extrasChoices"))
        .returningAll()
        .executeTakeFirstOrThrow()
    )
  }

  async delete(id: AttendeeId) {
    const res = await this.db.deleteFrom("attendee").where("id", "=", id).returningAll().executeTakeFirst()
    return res ? mapToAttendee(res) : null
  }

  async getById(id: AttendeeId): Promise<Attendee> {
    return mapToAttendee(
      await this.db.selectFrom("attendee").selectAll("attendee").where("id", "=", id).executeTakeFirstOrThrow()
    )
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    return await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .where("attendance.id", "=", attendanceId)
      .groupBy("attendee.id")
      .execute()
      .then((res) => res.map(mapToAttendee))
  }

  async getByAttendancePoolId(id: AttendancePoolId) {
    return await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
      .where("attendancePool.id", "=", id)
      .groupBy("attendee.id")
      .execute()
      .then((res) => res.map(mapToAttendee))
  }

  async update(obj: AttendeeWrite, id: AttendeeId) {
    const res = await this.db
      .updateTable("attendee")
      .set(withInsertJsonValue(obj, "extrasChoices"))
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst()

    return res ? mapToAttendee(res) : null
  }

  async updateExtraChoices(id: AttendeeId, choices: ExtrasChoices) {
    const res = await this.db
      .updateTable("attendee")
      .set({
        extrasChoices: JSON.stringify(choices),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst()

    return res ? mapToAttendee(res) : null
  }
}
