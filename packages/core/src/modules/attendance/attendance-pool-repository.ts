import { type Database } from "@dotkomonline/db"
import { type DeleteResult } from "@dotkomonline/db/utils"
import {
  AttendancePoolSchema,
  type AttendanceId,
  type AttendancePoolId,
  type AttendancePoolWrite,
} from "@dotkomonline/types"
import { Selectable, type Kysely } from "kysely"
import { prepareJsonInsert } from "../../utils/db-utils"
import { z } from "zod"

type DatabasePool1 = Selectable<Database["attendancePool"]>
type DatabasePool2 = Selectable<Database["attendancePool"]> & { numAttendees: number }

const Pool1 = AttendancePoolSchema.omit({
  numAttendees: true,
})
const Pool2 = AttendancePoolSchema

type Pool1 = z.infer<typeof Pool1>
type Pool2 = z.infer<typeof Pool2>

const mapToPool1 = (payload: DatabasePool1) => {
  return Pool1.parse(payload)
}

const mapToPool2 = (payload: DatabasePool2) => Pool2.parse(payload)

export interface AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<Pool2>
  delete(id: AttendancePoolId): Promise<DeleteResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<Pool2[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<Pool1>
  get(id: AttendancePoolId): Promise<Pool2 | null>
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

    return mapToPool2({
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
      .map(mapToPool2)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const insertObj = prepareJsonInsert(obj, "yearCriteria")
    const res = await this.db
      .updateTable("attendancePool")
      .set(insertObj)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToPool1(res)
  }
}
