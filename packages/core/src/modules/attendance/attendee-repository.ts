import { type Database } from "@dotkomonline/db"
import { type DeleteResult } from "@dotkomonline/db/utils"
import {
  AttendeeSchema,
  AttendeeUser,
  AttendeeUserSchema,
  type AttendanceId,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  type User,
  type UserId,
} from "@dotkomonline/types"
import { Selectable, sql, type Kysely } from "kysely"
import { prepareJsonInsert } from "../../utils/db-utils"

const mapToAttendee = (payload: Selectable<Database["attendee"]>): Attendee => AttendeeSchema.parse(payload)
const mapToAttendeeWithUser = (obj: unknown): AttendeeUser => AttendeeUserSchema.parse(obj)

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<DeleteResult>
  getById(id: AttendeeId): Promise<Attendee | null>
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<Attendee>
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<Attendee>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendeeUser[]>
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

    if (!res) {
      return null
    }

    return mapToAttendee(res)
  }

  async create(obj: AttendeeWrite): Promise<Attendee> {
    return mapToAttendee(
      await this.db
        .insertInto("attendee")
        .values(prepareJsonInsert(obj, "extrasChoices"))
        .returningAll()
        .executeTakeFirstOrThrow()
    )
  }

  async delete(id: AttendeeId): Promise<DeleteResult> {
    const res = await this.db.deleteFrom("attendee").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(res.numDeletedRows),
    }
  }

  async getById(id: AttendeeId): Promise<Attendee> {
    return mapToAttendee(
      await this.db.selectFrom("attendee").selectAll("attendee").where("id", "=", id).executeTakeFirstOrThrow()
    )
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("owUser", "owUser.id", "attendee.userId")
      .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .select(sql<User[]>`COALESCE(json_agg(ow_user) FILTER (WHERE ow_user.id IS NOT NULL), '[]')`.as("user"))
      .where("attendance.id", "=", attendanceId)
      .groupBy("attendee.id")
      .execute()

    return res
      .map((value) => ({
        ...value,
        user: {
          ...value.user[0],
          createdAt: new Date(value.user[0].createdAt),
          updatedAt: new Date(value.user[0].updatedAt),
          lastSyncedAt: value.user[0].lastSyncedAt ? new Date(value.user[0].lastSyncedAt) : null,
        },
      }))
      .map(mapToAttendeeWithUser)
  }

  async update(obj: AttendeeWrite, id: AttendeeId) {
    const res = await this.db
      .updateTable("attendee")
      .set(prepareJsonInsert(obj, "extrasChoices"))
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToAttendee(res)
  }

  async updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string) {
    const res = await this.db
      .updateTable("attendee")
      .set({
        extrasChoices: JSON.stringify([{ id: questionId, choice: choiceId }]),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToAttendee(res)
  }
}
