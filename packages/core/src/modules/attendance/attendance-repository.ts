import { type Database } from "@dotkomonline/db"
import {
  AttendanceSchema,
  type Attendance,
  type AttendanceId,
  type AttendanceWrite,
  type EventId,
} from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type DeleteResult, type UpdateResult } from "../utils"

const mapToAttendance = (obj: unknown): Attendance => AttendanceSchema.parse(obj)

export interface AttendanceRepository {
  create(obj: Partial<AttendanceWrite>): Promise<Attendance>
  delete(id: AttendanceId): Promise<DeleteResult>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<UpdateResult>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async create(obj: AttendanceWrite) {
    return mapToAttendance(await this.db.insertInto("attendance").returningAll().values(obj).executeTakeFirstOrThrow())
  }

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId) {
    const res = await this.db.updateTable("attendance").set(obj).where("id", "=", id).executeTakeFirstOrThrow()
    return {
      numUpdatedRows: Number(res.numUpdatedRows),
    }
  }

  async delete(id: AttendanceId) {
    const result = await this.db.deleteFrom("attendance").where("id", "=", id).executeTakeFirst()
    return {
      numDeletedRows: Number(result.numDeletedRows),
    }
  }

  async getById(id: AttendanceId) {
    const res = await this.db.selectFrom("attendance").selectAll("attendance").where("id", "=", id).executeTakeFirst()
    if (!res) {
      return null
    }
    return mapToAttendance(res)
  }
}
