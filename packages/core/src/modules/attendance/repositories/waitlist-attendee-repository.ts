import { type Database } from "@dotkomonline/db"
import {
  WaitlistAttendeeSchema,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  type WaitlistAttendeeWrite,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type DeleteResult } from "../../utils"

const mapToWaitlistAttendee = (obj: unknown): WaitlistAttendee => WaitlistAttendeeSchema.parse(obj)

export interface _WaitlistAttendeRepository {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<DeleteResult>
}

export class _WaitlistAttendeRepositoryImpl implements _WaitlistAttendeRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee> {
    return mapToWaitlistAttendee(
      await this.db.insertInto("waitlistAttendee").values(obj).returningAll().executeTakeFirstOrThrow()
    )
  }

  async delete(id: WaitlistAttendeeId): Promise<DeleteResult> {
    const res = await this.db.deleteFrom("waitlistAttendee").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(res.numDeletedRows),
    }
  }
}
