import { type Database } from "@dotkomonline/db"
import {
  AttendancePoolSchema,
  AttendancePoolWithNumAttendeesSchema,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWithNumAttendees,
  type AttendancePoolWrite,
  type EventId,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { prepareJsonInsert } from "../../../utils/db-utils"
import { type DeleteResult, type UpdateResult } from "../../utils"

const mapToPool = (obj: unknown): AttendancePool => AttendancePoolSchema.parse(obj)
const mapToPoolWithNumAttendees = (obj: unknown): AttendancePoolWithNumAttendees =>
  AttendancePoolWithNumAttendeesSchema.parse(obj)

export interface _AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<DeleteResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePoolWithNumAttendees[]>
  getByEventId(eventId: EventId): Promise<AttendancePoolWithNumAttendees[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<UpdateResult>
  get(id: AttendancePoolId): Promise<AttendancePool | undefined>
}

export class _PoolRepositoryImpl implements _AttendancePoolRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async get(id: AttendancePoolId) {
    const res = await this.db
      .selectFrom("attendancePool")
      .selectAll("attendancePool")
      .where("id", "=", id)
      .executeTakeFirst()

    if (!res) {
      return undefined
    }

    return mapToPool(res)
  }

  async create(obj: AttendancePoolWrite) {
    return mapToPool(
      await this.db
        .insertInto("attendancePool")
        .returningAll()
        .values(prepareJsonInsert(obj, "yearCriteria"))
        .executeTakeFirstOrThrow()
    )
  }

  async delete(id: AttendancePoolId): Promise<DeleteResult> {
    const res = await this.db.deleteFrom("attendancePool").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(res.numDeletedRows),
    }
  }

  async getByAttendanceId(id: AttendancePoolId): Promise<AttendancePoolWithNumAttendees[]> {
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
      .map(mapToPoolWithNumAttendees)
  }

  async getByEventId(id: EventId): Promise<AttendancePoolWithNumAttendees[]> {
    const res = await this.db
      .selectFrom("attendancePool")
      .selectAll("attendancePool")
      .leftJoin("attendee", "attendee.attendancePoolId", "attendancePool.id")
      .leftJoin("attendance", "attendance.id", "attendancePool.attendanceId")
      .where("attendance.eventId", "=", id)
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
      .map(mapToPoolWithNumAttendees)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId) {
    const insertObj = prepareJsonInsert(obj, "yearCriteria")
    console.log("INSERT")
    console.log(insertObj)

    const res = await this.db
      .updateTable("attendancePool")
      .set(insertObj)
      .where("id", "=", id)
      .executeTakeFirstOrThrow()
    return {
      numUpdatedRows: Number(res.numUpdatedRows),
    }
  }
}
