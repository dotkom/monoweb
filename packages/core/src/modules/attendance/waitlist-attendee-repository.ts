import type { Database } from "@dotkomonline/db"
import {
  type UserId,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  WaitlistAttendeeSchema,
  type WaitlistAttendeeWrite,
} from "@dotkomonline/types"
import type { Kysely } from "kysely"

const mapToWaitlistAttendee = (obj: unknown): WaitlistAttendee => WaitlistAttendeeSchema.parse(obj)

export interface WaitlistAttendeRepository {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  update(obj: Partial<WaitlistAttendeeWrite>, id: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  delete(id: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  getByAttendanceId(id: string): Promise<WaitlistAttendee[]>
  getByUserId(userId: UserId, waitlistAttendeeId: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  getByPoolId(poolId: string): Promise<WaitlistAttendee[]>
}

export class WaitlistAttendeRepositoryImpl implements WaitlistAttendeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return mapToWaitlistAttendee(
      await this.db.insertInto("waitlistAttendee").values(obj).returningAll().executeTakeFirstOrThrow()
    )
  }

  async update(obj: Partial<WaitlistAttendeeWrite>, id: WaitlistAttendeeId) {
    const res = await this.db
      .updateTable("waitlistAttendee")
      .set(obj)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst()
    return res ? mapToWaitlistAttendee(res) : null
  }

  async delete(id: WaitlistAttendeeId) {
    const res = await this.db.deleteFrom("waitlistAttendee").where("id", "=", id).executeTakeFirst()
    return res ? mapToWaitlistAttendee(res) : null
  }

  async getByAttendanceId(id: string) {
    const res = await this.db
      .selectFrom("waitlistAttendee")
      .selectAll("waitlistAttendee")
      .where("attendanceId", "=", id)
      .execute()

    return res.map(mapToWaitlistAttendee)
  }

  async getByUserId(userId: UserId, waitlistAttendeeId: WaitlistAttendeeId) {
    const res = await this.db
      .selectFrom("waitlistAttendee")
      .selectAll("waitlistAttendee")
      .where("userId", "=", userId)
      .where("id", "=", waitlistAttendeeId)
      .executeTakeFirst()
    return res ? mapToWaitlistAttendee(res) : null
  }

  async getByPoolId(poolId: string) {
    const res = await this.db
      .selectFrom("waitlistAttendee")
      .selectAll("waitlistAttendee")
      .where("attendancePoolId", "=", poolId)
      .execute()

    return res.map(mapToWaitlistAttendee)
  }
}
