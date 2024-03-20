import { type Database } from "@dotkomonline/db"
import {
  AttendancePool,
  AttendancePoolBase,
  AttendancePoolBaseSchema,
  AttendancePoolSchema,
  type AttendanceId,
  type AttendancePoolId,
  type AttendancePoolWrite,
} from "@dotkomonline/types"
import { Selectable, type Kysely } from "kysely"
import { withInsertJsonValue } from "../../utils/db-utils"

type DatabasePool = Selectable<Database["attendancePool"]> & { numAttendees: number }
type DatabasePoolBase = Selectable<Database["attendancePool"]>

const mapToPool = (payload: DatabasePool) => AttendancePoolSchema.parse(payload)
const mapToPoolBase = (payload: DatabasePoolBase) => AttendancePoolBaseSchema.parse(payload)

export interface AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<AttendancePoolBase | null>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePool[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<AttendancePoolBase | null>
  get(id: AttendancePoolId): Promise<AttendancePool | null>
  getNumAttendees(id: AttendancePoolId): Promise<number>
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
      .values(withInsertJsonValue(obj, "yearCriteria"))
      .executeTakeFirstOrThrow()

    const res = await this.get(result.id)
    if (res === null) {
      throw new Error("Failed to create pool, could not find pool after creation")
    }
    return res
  }

  async delete(id: AttendancePoolId) {
    const res = await this.db.deleteFrom("attendancePool").where("id", "=", id).returningAll().executeTakeFirst()

    return res ? mapToPoolBase(res) : null
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
    const insertObj = withInsertJsonValue(obj, "yearCriteria")
    const inserted = await this.db
      .updateTable("attendancePool")
      .set(insertObj)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return inserted ? mapToPoolBase(inserted) : null
  }

  async getNumAttendees(id: AttendancePoolId) {
    const res = await this.db
      .selectFrom("attendee")
      .where("attendancePoolId", "=", id)
      .select(({ fn }) => [fn.count("id").as("numAttendees")])
      .executeTakeFirstOrThrow()

    return Number(res.numAttendees)
  }
}
