import type { Database } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  AttendeeSchema,
  type AttendeeUser,
  AttendeeUserSchema,
  type AttendeeWrite,
  ExtrasChoices,
  type User,
  type UserId,
} from "@dotkomonline/types"
import { type Kysely, type Selectable, sql } from "kysely"
import { withInsertJsonValue } from "../../utils/db-utils"

const mapToAttendee = (payload: Selectable<Database["attendee"]>): Attendee => AttendeeSchema.parse(payload)
const mapToAttendeeWithUser = (obj: unknown): AttendeeUser => AttendeeUserSchema.parse(obj)

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee | null>
  getById(id: AttendeeId): Promise<Attendee | null>
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<Attendee | null>
  updateExtraChoices(id: AttendeeId, choices: ExtrasChoices): Promise<Attendee | null>
  getByAttendanceId(id: AttendanceId): Promise<AttendeeUser[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<AttendeeUser[]>
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
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("owUser", "owUser.id", "attendee.userId")
      .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .select(sql<User[]>`COALESCE(json_agg(ow_user), '[]')`.as("user"))
      .where("attendance.id", "=", attendanceId)
      .groupBy("attendee.id")
      .execute()

    const data: AttendeeUser[] = res.map((attendee) => {
      const user = attendee.user[0]
      const extrasChoices = ExtrasChoices.parse(attendee.extrasChoices)
      return {
        ...attendee,
        user: {
          ...user,
          lastSyncedAt: user.lastSyncedAt ? new Date(user.lastSyncedAt) : null,
        },
        extrasChoices,
      }
    })

    return res
      .map((value) => ({
        ...value,
        user: {
          ...value.user[0],
          lastSyncedAt: value.user[0].lastSyncedAt ? new Date(value.user[0].lastSyncedAt) : null,
        },
      }))
      .map(mapToAttendeeWithUser)
  }

  async getByAttendancePoolId(id: AttendancePoolId) {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .leftJoin("owUser", "owUser.id", "attendee.userId")
      .leftJoin("attendancePool", "attendee.attendancePoolId", "attendancePool.id")
      .select(sql<User[]>`COALESCE(json_agg(ow_user) FILTER (WHERE ow_user.id IS NOT NULL), '[]')`.as("user"))
      .where("attendancePool.id", "=", id)
      .groupBy("attendee.id")
      .execute()

    return res
      .map((value) => ({
        ...value,
        user: {
          ...value.user[0],
          lastSyncedAt: value.user[0].lastSyncedAt ? new Date(value.user[0].lastSyncedAt) : null,
        },
      }))
      .map(mapToAttendeeWithUser)
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
