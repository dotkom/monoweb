import type { Database } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  AttendanceSchema,
  type AttendanceWrite,
  type AttendeeId,
} from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { withInsertJsonValue } from "../../query"

type DatabaseAttendance = Selectable<Database["attendance"]>
const mapToAttendance = (obj: DatabaseAttendance): Attendance => AttendanceSchema.parse(obj)

export interface AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<Attendance | null>
  getById(id: AttendanceId): Promise<Attendance | null>
  getByAttendeeId(id: AttendeeId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
  getAll(): Promise<Attendance[]>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAll() {
    const res = await this.db.selectFrom("attendance").selectAll("attendance").execute()
    return res.map(mapToAttendance)
  }

  async create(obj: AttendanceWrite) {
    const res = await this.db
      .insertInto("attendance")
      .values(withInsertJsonValue(obj, "extras"))
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToAttendance(res)
  }

  async update(obj: Partial<AttendanceWrite>, id: AttendanceId) {
    const res = await this.db
      .updateTable("attendance")
      .set(withInsertJsonValue(obj, "extras"))
      .returningAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow()
    return mapToAttendance(res)
  }

  async delete(id: AttendanceId) {
    const result = await this.db.deleteFrom("attendance").where("id", "=", id).returningAll().executeTakeFirst()
    return result ? mapToAttendance(result) : null
  }

  async getById(id: AttendanceId) {
    const res = await this.db.selectFrom("attendance").selectAll("attendance").where("id", "=", id).executeTakeFirst()
    if (!res) {
      return null
    }
    return mapToAttendance(res)
  }

  async getByAttendeeId(id: AttendeeId) {
    const res = await this.db
      .selectFrom("attendance")
      .selectAll("attendance")
      .leftJoin("attendee", "attendee.attendanceId", "attendance.id")
      .where("attendee.id", "=", id)
      .executeTakeFirst()

    return res ? mapToAttendance(res) : null
  }
}
