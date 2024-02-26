import { type Database } from "@dotkomonline/db"
import {
  AttendancePoolSchema,
  AttendanceSchema,
  AttendeeSchema,
  type UserId,
  WaitlistAttendeeSchema,
  type Attendance,
  type AttendanceId,
  type AttendancePool,
  type AttendancePoolId,
  type AttendancePoolWrite,
  type AttendanceWrite,
  type Attendee,
  type AttendeeId,
  type AttendeeWrite,
  type EventId,
  type WaitlistAttendee,
  type WaitlistAttendeeId,
  type WaitlistAttendeeWrite,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type DeleteResult, type UpdateResult } from "../utils"

function prepareJsonInsert<T extends object>(obj: T, key: keyof T): T & { [key in keyof T]: string } {
  return {
    ...obj,
    [key]: JSON.stringify(obj[key]),
  }
}

const mapToAttendance = (obj: unknown): Attendance => AttendanceSchema.parse(obj)
const mapToPool = (obj: unknown): AttendancePool => AttendancePoolSchema.parse(obj)
const mapToAttendee = (obj: unknown): Attendee => AttendeeSchema.parse(obj)
const mapToWaitlistAttendee = (obj: unknown): WaitlistAttendee => WaitlistAttendeeSchema.parse(obj)

// Responsible for:
//  attendance
//  attendance_pool
//  waitlist_attendee
//  attendee
interface _AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<DeleteResult>
  getById(id: AttendanceId): Promise<Attendance | undefined>
  getByEventId(id: EventId): Promise<Attendance>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<UpdateResult>
}

interface _AttendancePoolRepository {
  create(obj: AttendancePoolWrite): Promise<AttendancePool>
  delete(id: AttendancePoolId): Promise<DeleteResult>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendancePool[]>
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
  getByAttendanceId(attendanceId: AttendanceId): Promise<Attendee[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
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

  async getByEventId(id: EventId): Promise<Attendance> {
    return mapToAttendance(
      await this.db.selectFrom("attendance").selectAll("attendance").where("eventId", "=", id).executeTakeFirstOrThrow()
    )
  }
}

class _PoolRepositoryImpl implements _AttendancePoolRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async get(id: AttendancePoolId): Promise<AttendancePool | undefined> {
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

  async create(obj: AttendancePoolWrite): Promise<AttendancePool> {
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

  async getByAttendanceId(id: AttendanceId): Promise<AttendancePool[]> {
    const res = await this.db
      .selectFrom("attendancePool")
      .selectAll("attendancePool")
      .where("attendanceId", "=", id)
      .execute()
    return res.map(mapToPool)
  }

  async update(obj: Partial<AttendancePoolWrite>, id: AttendancePoolId): Promise<UpdateResult> {
    const res = await this.db
      .updateTable("attendancePool")
      .set(prepareJsonInsert(obj, "yearCriteria"))
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

  async getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null> {
    const res = await this.db
      .selectFrom("attendee")
      .selectAll("attendee")
      .where("userId", "=", userId)
      .where("attendancePoolId", "=", attendanceId)
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

  async getByAttendanceId(attendanceId: AttendanceId): Promise<Attendee[]> {
    return (
      await this.db
        .selectFrom("attendee")
        .selectAll("attendee")
        .where("attendee.attendancePoolId", "=", attendanceId)
        .execute()
    ).map(mapToAttendee)
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
