import type { DBClient, DBContext } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  AttendeeSelectionResponsesSchema as AttendeeSelectionOptionSchema,
  AttendeeSelectionResponsesSchema,
  type AttendeeWithoutUser,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { AttendeeWriteError } from "./attendee-error"

type UnparsedAttendeeWithoutUser = Omit<AttendeeWithoutUser, "selections"> & {
  selections?: JsonValue
}

export interface AttendeeRepository {
  create(data: AttendeeWrite): Promise<AttendeeWithoutUser>
  delete(attendeeId: AttendeeId): Promise<void>
  getById(attendeeId: AttendeeId): Promise<AttendeeWithoutUser | null>
  update(attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<AttendeeWithoutUser>
  getByAttendanceId(attendanceId: AttendanceId): Promise<AttendeeWithoutUser[]>
  getByAttendancePoolId(attendancePoolId: AttendancePoolId): Promise<AttendeeWithoutUser[]>
  getFirstUnreservedByAttendancePoolId(attendancePoolId: AttendancePoolId): Promise<AttendeeWithoutUser | null>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<AttendeeWithoutUser | null>
  poolHasAttendees(poolId: AttendancePoolId): Promise<boolean>
  attendanceHasAttendees(attendanceId: AttendanceId): Promise<boolean>
  reserveAttendee(attendeeId: AttendeeId): Promise<boolean>
  moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId): Promise<void>
  removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: string): Promise<void>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private validateWrite(data: Partial<AttendeeWrite>) {
    if (!data.selections) {
      return
    }

    const selectionResponseParseResult = AttendeeSelectionOptionSchema.safeParse(data.selections)

    if (!selectionResponseParseResult.success) {
      throw new AttendeeWriteError("Invalid JSON data in AttendeeWrite field selectionResponses")
    }
  }

  private parse(unparsedAttendee: UnparsedAttendeeWithoutUser): AttendeeWithoutUser {
    const parsedSelections = unparsedAttendee.selections
      ? AttendeeSelectionResponsesSchema.parse(unparsedAttendee.selections)
      : []

    return {
      ...unparsedAttendee,
      selections: parsedSelections,
    }
  }

  public async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const attendee = await this.db.attendee.findFirst({ where: { userId, attendanceId } })

    if (!attendee) {
      return null
    }

    return this.parse(attendee)
  }

  public async poolHasAttendees(attendancePoolId: AttendancePoolId) {
    const numberOfAttendees = await this.db.attendee.count({ where: { attendancePoolId } })

    return numberOfAttendees > 0
  }

  public async attendanceHasAttendees(attendanceId: AttendanceId) {
    const numberOfAttendees = await this.db.attendee.count({ where: { attendanceId } })

    return numberOfAttendees > 0
  }

  public async moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId) {
    await this.db.attendee.updateMany({
      where: { attendancePoolId: { in: fromPoolIds } },
      data: { attendancePoolId: toPoolId },
    })
  }

  public async create(data: AttendeeWrite) {
    this.validateWrite(data)

    const attendee = await this.db.attendee.create({ data })

    return this.parse(attendee)
  }

  public async delete(attendeeId: AttendeeId) {
    await this.db.attendee.delete({ where: { id: attendeeId } })
  }

  public async getById(attendeeId: AttendeeId) {
    const attendee = await this.db.attendee.findUnique({ where: { id: attendeeId } })

    if (!attendee) {
      return null
    }

    return this.parse(attendee)
  }

  public async getByAttendanceId(attendanceId: AttendanceId) {
    const attendees = await this.db.attendee.findMany({
      where: { attendanceId },
      orderBy: { reserveTime: "asc" },
    })

    return attendees.map((attendee) => this.parse(attendee))
  }

  public async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({
      where: { attendancePoolId },
      orderBy: { reserveTime: "asc" },
    })

    return attendees.map((attendee) => this.parse(attendee))
  }

  public async getFirstUnreservedByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendee = await this.db.attendee.findFirst({
      where: { attendancePoolId, reserved: false },
      orderBy: { reserveTime: "asc" },
    })

    if (!attendee) {
      return null
    }

    return this.parse(attendee)
  }

  public async update(attendeeId: AttendeeId, data: Partial<AttendeeWrite>) {
    this.validateWrite(data)

    const updatedAttendee = await this.db.attendee.update({ where: { id: attendeeId }, data })

    return this.parse(updatedAttendee)
  }

  public async countReservedCapacityForUpdate(attendancePoolId: AttendancePoolId, tx: DBContext) {
    const result: number =
      await tx.$queryRaw`SELECT count(*) FROM attendee WHERE "attendancePoolId" = ${attendancePoolId} FOR UPDATE`

    return result
  }

  public async reserveAttendee(attendeeId: AttendeeId) {
    const attendee = await this.db.attendee.update({
      where: {
        id: attendeeId,
      },
      data: {
        reserved: true,
      },
    })

    return attendee.reserved
  }

  public async removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: string) {
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
