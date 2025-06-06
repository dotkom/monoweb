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
import { AttendeeNotFoundError, AttendeeWriteError } from "./attendee-error"

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Attendee>
  getById(id: AttendeeId): Promise<Attendee>
  update(id: AttendeeId, obj: Partial<AttendeeWrite>): Promise<Attendee>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getFirstUnreservedByAttendancePoolId(id: AttendancePoolId): Promise<Attendee | null>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
  poolHasAttendees(poolId: AttendancePoolId): Promise<boolean>
  checkCapacityAndReserve(attendeeId: AttendeeId): Promise<void>
  moveFromMultiplePoolsToPool(oldPoolIds: AttendancePoolId[], newPoolId: AttendancePoolId): Promise<void>
  removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: string): Promise<void>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

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
    const attendees = await this.db.attendee.findMany({ where: { attendanceId }, orderBy: { reserveTime: "asc" } })

    return attendees.map(this.parseSelectionResponses)
  }

  async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({ where: { attendancePoolId }, orderBy: { reserveTime: "asc" } })

    return attendees.map(this.parseSelectionResponses)
  }

  async getFirstUnreservedByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendee = await this.db.attendee.findFirst({
      where: { attendancePoolId, reserved: false },
      orderBy: { reserveTime: "asc" },
    })

    if (attendee === null) return null

    return this.parseSelectionResponses(attendee)
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

  async removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: string) {
    const attendees = (await this.db.attendee.findMany({
      where: { attendanceId },
      select: {
        id: true,
        selections: true,
      },
    })) as Pick<Attendee, "id" | "selections">[]

    const updatedRows = attendees
      .filter(({ selections }) => selections.length > 0)
      .map(({ id, selections: oldSelections }) => {
        const selections = oldSelections.filter((oldSelection) => oldSelection.selectionId !== selectionId)

        return this.db.attendee.update({
          where: { id },
          data: { selections },
        })
      })

    await this.db.$transaction(updatedRows)
  }
}
