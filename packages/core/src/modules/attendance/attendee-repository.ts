import type { DBClient } from "@dotkomonline/db"
import {
  AttendanceId,
  AttendancePoolId,
  Attendee,
  AttendeeId,
  AttendeeWrite,
  ExtrasChoices,
  ExtrasChoicesSchema,
  UserId,
} from "@dotkomonline/types"
import { Prisma } from "@prisma/client"
import { JsonValue } from "@prisma/client/runtime/library"
import type { ZodSchema } from "zod"

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee | null>
  getById(id: AttendeeId): Promise<Attendee | null>
  update(obj: Partial<AttendeeWrite>, id: AttendeeId): Promise<Attendee | null>
  updateExtraChoices(id: AttendeeId, choices: ExtrasChoices): Promise<Attendee | null>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  constructor(private readonly db: DBClient) {}

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.db.attendee.findFirst({ where: { userId, attendanceId }})

    if (user === null)
      return null

    return this.parseExtrasChoices(user)
  }

  async create(data: AttendeeWrite): Promise<Attendee> {
    const createdUser = await this.db.attendee.create({ data })

    return this.parseExtrasChoices(createdUser)
  }

  async delete(id: AttendeeId) {
    const deletedUser = await this.db.attendee.delete({ where: { id } })

    return this.parseExtrasChoices(deletedUser)
  }

  async getById(id: AttendeeId): Promise<Attendee | null> {
    const user = await this.db.attendee.findUnique({ where: { id } })

    if (user === null)
      return null

    return this.parseExtrasChoices(user)
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const attendees = await this.db.attendee.findMany({ where: { attendanceId } })

    return attendees.map(this.parseExtrasChoices)
  }

  async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({ where: { attendancePoolId } })

    return attendees.map(this.parseExtrasChoices)
  }

  async update(data: Partial<AttendeeWrite>, id: AttendeeId) {
    const updatedUser = await this.db.attendee.update({ where: { id }, data })

    return this.parseExtrasChoices(updatedUser)
  }

  // TODO: Remove this, this is not necessary
  async updateExtraChoices(id: AttendeeId, extrasChoices: ExtrasChoices): Promise<Attendee | null> {
    return this.update({ extrasChoices }, id)
  }

  private parseExtrasChoices<T extends { extrasChoices: JsonValue }>(
    unparsedObj: T
  ): Omit<T, "extrasChoices"> & { extrasChoices: ExtrasChoices } {
    const { extrasChoices, ...obj } = unparsedObj

    return { ...obj, extrasChoices: ExtrasChoicesSchema.parse(extrasChoices) }
  }
}
