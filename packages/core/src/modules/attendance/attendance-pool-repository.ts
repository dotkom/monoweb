import { type Database } from "@dotkomonline/db"
import { type DeleteResult } from "@dotkomonline/db/utils"
import {
  AttendancePool,
  AttendancePoolSchema,
  type AttendanceId,
  type AttendancePoolId,
  type AttendancePoolWrite,
} from "@dotkomonline/types"
import { Selectable, type Kysely } from "kysely"
import { prepareJsonInsert } from "../../utils/db-utils"
import { z } from "zod"

type DatabasePool = Selectable<Database["attendancePool"]> & { numAttendees: number }

const mapToPool = (payload: DatabasePool) => AttendancePoolSchema.parse(payload)

export interface AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<DeleteResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePool[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePool>
  get(id: AttendancePoolId): Promise<AttendancePool | null>
}

export class AttendancePoolRepositoryImpl implements AttendancePoolRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async get(id: AttendancePoolId) {
    const res = await this.db
      .selectFrom("attendancePool")
      .selectAll("attendancePool")
      .leftJoin("attendee", "attendee.attendancePoolId", "attendancePool.id")
      .select(({ fn, val, ref }) => [
        fn.count(ref("attendee.id")).as("numAttendees"),
        val("attendancePool.id").as("poolId"),
      ])
      .groupBy("attendancePool.id")
      .where("attendancePool.id", "=", id)
      .executeTakeFirst()

    if (!res) {
      return null
    }

    return mapToPool({
      ...res,
      numAttendees: Number(res.numAttendees),
    })
  }

  async create(obj: AttendancePoolWrite) {
    const result = await this.db
      .insertInto("attendancePool")
      .returning("attendancePool.id")
      .values(prepareJsonInsert(obj, "yearCriteria"))
      .executeTakeFirstOrThrow()

    if (result.id === undefined) {
      throw new Error("Failed to create pool")
    }

    const res = await this.get(result.id)
    if (res === null) {
      throw new Error("Failed to create pool, could not find pool after creation")
    }
    return res
  }

  async delete(id: AttendancePoolId) {
    const res = await this.db.deleteFrom("attendancePool").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(res.numDeletedRows),
    }
  }

  async getByAttendanceId(id: AttendancePoolId) {
    const res = await this.db
      .selectFrom("attendancePool")
      .selectAll("attendancePool")
      .where("attendanceId", "=", id)
      .leftJoin("attendee", "attendee.attendancePoolId", "attendancePool.id")
      .select(({ fn, val, ref }) => [
        fn.count(ref("attendee.id")).as("numAttendees"),
        val("attendancePool.id").as("poolId"),
      ])
      .groupBy("attendancePool.id")
      .execute()

    return res
      .map((pool) => ({
        ...pool,
        numAttendees: Number(pool.numAttendees),
      }))
      .map(mapToPool)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const insertObj = prepareJsonInsert(obj, "yearCriteria")
    await this.db.updateTable("attendancePool").set(insertObj).where("id", "=", id).executeTakeFirstOrThrow()

    const res = await this.get(id)
    if (res === null) {
      throw new Error("Failed to update pool, could not find pool after update")
    }

    return mapToPool(res)
  }
}
