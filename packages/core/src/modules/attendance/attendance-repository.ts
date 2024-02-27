import { type Database } from "@dotkomonline/db"
import {
  AttendancePoolSchema,
  type AttendancePoolWithNumAttendees,
  AttendanceSchema,
  AttendeeDBUserSchema,
  AttendeeSchema,
  WaitlistAttendeeSchema,
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceWrite,
  type Attendee,
  type AttendeeDBUser,
  type AttendeeId,
  type AttendeeWrite,
  type EventId,
  type UserDB,
  type UserId,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  type WaitlistAttendeeWrite,
  AttendancePoolWithNumAttendeesSchema,
} from "@dotkomonline/types"
import { sql, type Kysely } from "kysely"
import { type DeleteResult, type UpdateResult } from "../utils"

function prepareJsonInsert<T extends object>(obj: T, key: keyof T): T & { [key in keyof T]: string } {
  return {
    ...obj,
    [key]: JSON.stringify(obj[key]),
  }
}

const mapToAttendance = (obj: unknown): Attendance => AttendanceSchema.parse(obj)
const mapToPool = (obj: unknown): AttendancePool => AttendancePoolSchema.parse(obj)
const mapToPoolWithNumAttendees = (obj: unknown): AttendancePoolWithNumAttendees =>
  AttendancePoolWithNumAttendeesSchema.parse(obj)
const mapToAttendee = (obj: unknown): Attendee => AttendeeSchema.parse(obj)
const mapToAttendeeWithUser = (obj: unknown): AttendeeDBUser => AttendeeDBUserSchema.parse(obj)
const mapToWaitlistAttendee = (obj: unknown): WaitlistAttendee => WaitlistAttendeeSchema.parse(obj)

// Responsible for:
//  attendance
//  attendance_pool
//  waitlist_attendee
//  attendee
interface _AttendanceRepository {
  create(obj: Partial<AttendanceWrite>): Promise<Attendance>
  delete(id: AttendanceId): Promise<DeleteResult>
  getById(id: AttendanceId): Promise<Attendance | undefined>
  getByEventId(id: EventId): Promise<Attendance | undefined>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<UpdateResult>
}

interface _AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<DeleteResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePoolWithNumAttendees[]>
  update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<UpdateResult>
  get(id: AttendancePoolId): Promise<AttendancePool | undefined>
}

interface _WaitlistAttendeRepository {
  create(obj: WaitlistAttendeeWrite): Promise<WaitlistAttendee>
  delete(id: WaitlistAttendeeId): Promise<DeleteResult>
}

interface _AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<DeleteResult>
  getByPoolId(poolId: AttendancePoolId): Promise<Attendee[]>
  getById(id: AttendeeId): Promise<Attendee>
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<UpdateResult>
  updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<UpdateResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendeeDBUser[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | undefined>
}

export interface AttendanceRepository {
  attendance: _AttendanceRepository
  pool: _AttendancePoolRepository
  waitlistAttendee: _WaitlistAttendeRepository
  attendee: _AttendeeRepository
}

class _AttendanceRepositoryImpl implements _AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async create(obj: AttendanceWrite): Promise<Attendance> {
    return mapToAttendance(await this.db.insertInto("attendance").returningAll().values(obj).executeTakeFirstOrThrow())
  }

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<UpdateResult> {
    const res = await this.db.updateTable("attendance").set(obj).where("id", "=", id).executeTakeFirstOrThrow()
    return {
      numUpdatedRows: Number(res.numUpdatedRows),
    }
  }

  async delete(id: AttendanceId): Promise<DeleteResult> {
    const result = await this.db.deleteFrom("attendance").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(result.numDeletedRows),
    }
  }

  async getById(id: AttendanceId): Promise<Attendance | undefined> {
    const res = await this.db.selectFrom("attendance").selectAll("attendance").where("id", "=", id).executeTakeFirst()
    if (!res) {
      return undefined
    }
    return mapToAttendance(res)
  }

  async getByEventId(id: EventId) {
    // return mapToAttendance(
    //   await this.db.selectFrom("attendance").selectAll("attendance").where("eventId", "=", id).executeTakeFirstOrThrow()
    // )

    const res = await this.db
      .selectFrom("attendance")
      .selectAll("attendance")
      .where("eventId", "=", id)
      .executeTakeFirst()

    if (!res) {
      return undefined
    }

    return mapToAttendance(res)
  }
}

class _PoolRepositoryImpl implements _AttendancePoolRepository {
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

class _WaitlistAttendeRepositoryImpl implements _WaitlistAttendeRepository {
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

class _AttendeeRepositoryImpl implements _AttendeeRepository {
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
      return undefined
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
      .select(sql<UserDB[]>`COALESCE(json_agg(ow_user) FILTER (WHERE ow_user.id IS NOT NULL), '[]')`.as("user"))
      .where("attendance.id", "=", attendanceId)
      .groupBy("attendee.id")
      .execute()

    console.log("-----------------------")
    console.dir(res, { depth: null })

    return res
      .map((value) => ({
        ...value,
        user: {
          ...value.user[0],
          createdAt: new Date(value.user[0].createdAt),
        },
      }))
      .map(mapToAttendeeWithUser)
  }

  async getByPoolId(poolId: AttendancePoolId): Promise<Attendee[]> {
    return (
      await this.db.selectFrom("attendee").selectAll("attendee").where("attendancePoolId", "=", poolId).execute()
    ).map(mapToAttendee)
  }

  async update(obj: AttendeeWrite, id: AttendeeId): Promise<UpdateResult> {
    const res = await this.db
      .updateTable("attendee")
      .set(prepareJsonInsert(obj, "extrasChoices"))
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    return {
      numUpdatedRows: Number(res.numUpdatedRows),
    }
  }

  async updateExtraChoices(id: AttendeeId, questionId: string, choiceId: string): Promise<UpdateResult> {
    const res = await this.db
      .updateTable("attendee")
      .set({ extrasChoices: JSON.stringify([{ id: questionId, choice: choiceId }]) })
      .where("id", "=", id)
      .executeTakeFirstOrThrow()

    return { numUpdatedRows: Number(res.numUpdatedRows) }
  }
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  attendance: _AttendanceRepository
  pool: _AttendancePoolRepository
  waitlistAttendee: _WaitlistAttendeRepository
  attendee: _AttendeeRepository
  constructor(private readonly db: Kysely<Database>) {
    this.attendance = new _AttendanceRepositoryImpl(this.db)
    this.pool = new _PoolRepositoryImpl(this.db)
    this.waitlistAttendee = new _WaitlistAttendeRepositoryImpl(this.db)
    this.attendee = new _AttendeeRepositoryImpl(this.db)
  }
}
