import { type Database } from "@dotkomonline/db"
import {
  WaitlistAttendeeSchema,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  type WaitlistAttendeeWrite,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"

const mapToWaitlistAttendee = (obj: unknown): WaitlistAttendee => WaitlistAttendeeSchema.parse(obj)

export interface WaitlistAttendeRepository {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<WaitlistAttendee | null>
  getByAttendanceId(id: string): Promise<WaitlistAttendee[]>
}

export class WaitlistAttendeRepositoryImpl implements WaitlistAttendeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return mapToWaitlistAttendee(
      await this.db.insertInto("waitlistAttendee").values(obj).returningAll().executeTakeFirstOrThrow()
    )
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
}
