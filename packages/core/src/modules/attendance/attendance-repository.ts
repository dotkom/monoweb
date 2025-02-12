import type { DBClient } from "@dotkomonline/db"
import {
  type Attendance,
  type AttendanceId,
  type AttendanceWrite,
  type AttendeeId,
  type Extras,
  ExtrasSchema,
} from "@dotkomonline/types"
import { Prisma } from "@prisma/client"
import type { JsonValue } from "@prisma/client/runtime/library"

export interface AttendanceRepository {
  create(obj: AttendanceWrite): Promise<Attendance>
  delete(id: AttendanceId): Promise<Attendance | null>
  getById(id: AttendanceId): Promise<Attendance | null>
  getByAttendeeId(id: AttendeeId): Promise<Attendance | null>
  update(obj: Partial<AttendanceWrite>, id: AttendanceId): Promise<Attendance>
  getAll(): Promise<Attendance[]>
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  constructor(private readonly db: DBClient) {}

  async getAll() {
    const attendances = await this.db.attendance.findMany({})

    return attendances.map(this.parseExtras)
  }

  async create(data: AttendanceWrite) {
    const createdAttendance = await this.db.attendance.create({
      data: this.correctNullTypes(data),
    })

    return this.parseExtras(createdAttendance)
  }

  async update(data: Partial<AttendanceWrite>, id: AttendanceId) {
    const updatedAttendance = await this.db.attendance.update({
      data: this.correctNullTypes(data),
      where: { id },
    })

    return this.parseExtras(updatedAttendance)
  }

  async delete(id: AttendanceId) {
    const deletedAttendance = await this.db.attendance.delete({ where: { id } })
    return this.parseExtras(deletedAttendance)
  }

  async getById(id: AttendanceId) {
    const attendance = await this.db.attendance.findUnique({ where: { id } })

    if (!attendance) return null

    return this.parseExtras(attendance)
  }

  async getByAttendeeId(id: AttendeeId) {
    const attendance = await this.db.attendance.findFirst({
      where: {
        attendees: {
          some: {
            id,
          },
        },
      },
    })

    if (attendance === null) return null

    return this.parseExtras(attendance)
  }

  // Prisma requires distinction between database null and json null, so here we choose database null
  private correctNullTypes<T extends { extras?: unknown }>(data: T) {
    return { ...data, extras: data.extras === null ? Prisma.DbNull : data.extras }
  }

  // Takes an object with unparsed JSON value yearCriteria and returns it with yearCriteria parsed
  private parseExtras<T extends { extras: JsonValue }>(unparsedObj: T): Omit<T, "extras"> & { extras: Extras[] | null } {
    const { extras, ...attendance } = unparsedObj

    return { ...attendance, extras: ExtrasSchema.parse(extras) }
  }
}
