import { type Database } from "@dotkomonline/db"
import { type DeleteResult } from "@dotkomonline/db/utils"
import { AttendanceSchema, type Attendance, type AttendanceId, type AttendanceWrite } from "@dotkomonline/types"
import { Selectable, type Kysely } from "kysely"

type DatabaseAttendance = Selectable<Database["attendance"]>
const mapToAttendance = (obj: DatabaseAttendance): Attendance => AttendanceSchema.parse(obj)

export interface AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<DeleteResult>
  getById(id: AttendanceId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async create(obj: AttendanceWrite) {
    console.log("inserting", obj)
    const res = await this.db.insertInto("attendance").values(obj).returningAll().executeTakeFirstOrThrow()
    console.log(res)
    return mapToAttendance(res)
  }

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId) {
    const res = await this.db
      .updateTable("attendance")
      .set(obj)
      .returningAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow()
    return mapToAttendance(res)
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
