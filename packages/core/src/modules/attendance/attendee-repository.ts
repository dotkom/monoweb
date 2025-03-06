import type { DBClient, DBContext } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  AttendeeSelectionResponsesSchema as AttendeeSelectionOptionSchema,
  type AttendeeSelectionResponse,
  AttendeeSelectionResponsesSchema,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { AttendeeNotFoundError } from "../event/attendee-error"
import { AttendeeWriteError } from "./attendee-error"

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee>
  getById(id: AttendeeId): Promise<Attendee>
  update(id: AttendeeId, obj: Partial<AttendeeWrite>): Promise<Attendee>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
  poolHasAttendees(poolId: AttendancePoolId): Promise<boolean>
  checkCapacityAndReserve(attendeeId: AttendeeId): Promise<void>
  moveFromMultiplePoolsToPool(oldPoolIds: AttendancePoolId[], newPoolId: AttendancePoolId): Promise<void>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  constructor(private readonly db: DBClient) {}

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const user = await this.db.attendee.findFirst({ where: { userId, attendanceId } })

    if (user === null) return null

    return this.parseSelectionResponses(user)
  }

  async poolHasAttendees(attendancePoolId: AttendancePoolId): Promise<boolean> {
    return (await this.db.attendee.count({ where: { attendancePoolId } })) > 0
  }

  async moveFromMultiplePoolsToPool(oldPoolIds: AttendancePoolId[], newPoolId: AttendancePoolId) {
    await this.db.attendee.updateMany({
      where: { attendancePoolId: { in: oldPoolIds } },
      data: { attendancePoolId: newPoolId },
    })
  }

  async create(data: AttendeeWrite): Promise<Attendee> {
    this.validateWrite(data)

    const createdUser = await this.db.attendee.create({ data })

    return this.parseSelectionResponses(createdUser)
  }

  async delete(id: AttendeeId) {
    const deletedUser = await this.db.attendee.delete({ where: { id } })

    return this.parseSelectionResponses(deletedUser)
  }

  async getById(id: AttendeeId): Promise<Attendee> {
    const user = await this.db.attendee.findUnique({ where: { id } })

    if (user === null) {
      throw new AttendeeNotFoundError(id)
    }

    return this.parseSelectionResponses(user)
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const attendees = await this.db.attendee.findMany({ where: { attendanceId } })

    return attendees.map(this.parseSelectionResponses)
  }

  async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({ where: { attendancePoolId } })

    return attendees.map(this.parseSelectionResponses)
  }

  async update(id: AttendeeId, data: Partial<AttendeeWrite>) {
    this.validateWrite(data)

    const updatedAttendee = await this.db.attendee.update({ where: { id }, data })

    return this.parseSelectionResponses(updatedAttendee)
  }

  async countReservedCapacityForUpdate(attendancePoolId: AttendancePoolId, tx: DBContext) {
    const result: number =
      await tx.$queryRaw`SELECT count(*) FROM attendee WHERE "attendancePoolId" = ${attendancePoolId} FOR UPDATE`

    return result
  }

  private validateWrite(data: Partial<AttendeeWrite>) {
    if (data.selections) {
      const selectionResponseParseResult = AttendeeSelectionOptionSchema.safeParse(data.selections)

      if (!selectionResponseParseResult.success) {
        throw new AttendeeWriteError("Invalid JSON data in AttendeeWrite field selectionResponses")
      }
    }
  }

  private parseSelectionResponses<T extends { selections: JsonValue }>({
    selections,
    ...obj
  }: T): Omit<T, "selections"> & { selections: AttendeeSelectionResponse } {
    return { ...obj, selections: AttendeeSelectionResponsesSchema.parse(selections) }
  }

  async checkCapacityAndReserve(id: AttendeeId) {
    await this.db.attendee.updateMany({
      where: {
        id,
      },
      data: {
        reserved: true,
      },
    })
  }
}
