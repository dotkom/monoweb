import type { DBClient, DBContext } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type Attendee,
  type AttendeeId,
  AttendeeSelectionResponsesSchema as AttendeeSelectionOptionSchema,
  AttendeeSelectionResponsesSchema,
  type AttendeeWrite,
  type User,
  type UserId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { UserRepository } from "../user/user-repository"
import { AttendeeWriteError } from "./attendee-error"

type UnparsedAttendee = Omit<Attendee, "user" | "selections"> & {
  selections?: JsonValue
}

export interface AttendeeRepository {
  create(data: AttendeeWrite): Promise<Attendee>
  delete(attendeeId: AttendeeId): Promise<void>
  getById(attendeeId: AttendeeId): Promise<Attendee | null>
  update(attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<Attendee>
  getByAttendanceId(attendanceId: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(attendancePoolId: AttendancePoolId): Promise<Attendee[]>
  getFirstUnreservedByAttendancePoolId(attendancePoolId: AttendancePoolId): Promise<Attendee | null>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
  poolHasAttendees(poolId: AttendancePoolId): Promise<boolean>
  attendanceHasAttendees(attendanceId: AttendanceId): Promise<boolean>
  reserveAttendee(attendeeId: AttendeeId): Promise<boolean>
  moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId): Promise<void>
  removeAllSelectionResponsesForSelection(attendanceId: AttendanceId, selectionId: string): Promise<void>
}

export class AttendeeRepositoryImpl implements AttendeeRepository {
  private readonly db: DBClient
  private readonly userRepository: UserRepository

  constructor(db: DBClient, userRepository: UserRepository) {
    this.db = db
    this.userRepository = userRepository
  }

  async getByUserId(userId: UserId, attendanceId: AttendanceId) {
    const attendee = await this.db.attendee.findFirst({ where: { userId, attendanceId } })

    if (!attendee) {
      return null
    }

    const user = await this.userRepository.getById(userId)

    return this.parse(attendee, user)
  }

  async poolHasAttendees(attendancePoolId: AttendancePoolId) {
    const numberOfAttendees = await this.db.attendee.count({ where: { attendancePoolId } })

    return numberOfAttendees > 0
  }

  async attendanceHasAttendees(attendanceId: AttendanceId) {
    const numberOfAttendees = await this.db.attendee.count({ where: { attendanceId } })

    return numberOfAttendees > 0
  }

  async moveFromMultiplePoolsToPool(fromPoolIds: AttendancePoolId[], toPoolId: AttendancePoolId) {
    await this.db.attendee.updateMany({
      where: { attendancePoolId: { in: fromPoolIds } },
      data: { attendancePoolId: toPoolId },
    })
  }

  async create(data: AttendeeWrite) {
    this.validateWrite(data)

    const attendee = await this.db.attendee.create({ data })
    const user = await this.userRepository.getById(attendee.userId)

    return this.parse(attendee, user)
  }

  async delete(attendeeId: AttendeeId) {
    await this.db.attendee.delete({ where: { id: attendeeId } })
  }

  async getById(attendeeId: AttendeeId) {
    const attendee = await this.db.attendee.findUnique({ where: { id: attendeeId } })

    if (!attendee) {
      return null
    }

    const user = await this.userRepository.getById(attendee.userId)

    return this.parse(attendee, user)
  }

  async getByAttendanceId(attendanceId: AttendanceId) {
    const attendees = await this.db.attendee.findMany({
      where: { attendanceId },
      orderBy: { reserveTime: "asc" },
    })

    const users = await Promise.all(attendees.map((attendee) => this.userRepository.getById(attendee.userId)))

    return attendees.map((attendee, index) => this.parse(attendee, users[index]))
  }

  async getByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendees = await this.db.attendee.findMany({
      where: { attendancePoolId },
      orderBy: { reserveTime: "asc" },
    })

    const users = await Promise.all(attendees.map((attendee) => this.userRepository.getById(attendee.userId)))

    return attendees.map((attendee, index) => this.parse(attendee, users[index]))
  }

  async getFirstUnreservedByAttendancePoolId(attendancePoolId: AttendancePoolId) {
    const attendee = await this.db.attendee.findFirst({
      where: { attendancePoolId, reserved: false },
      orderBy: { reserveTime: "asc" },
    })

    if (!attendee) {
      return null
    }

    const user = await this.userRepository.getById(attendee.userId)

    return this.parse(attendee, user)
  }

  async update(attendeeId: AttendeeId, data: Partial<AttendeeWrite>) {
    this.validateWrite(data)

    const updatedAttendee = await this.db.attendee.update({ where: { id: attendeeId }, data })
    const user = await this.userRepository.getById(updatedAttendee.userId)

    return this.parse(updatedAttendee, user)
  }

  async countReservedCapacityForUpdate(attendancePoolId: AttendancePoolId, tx: DBContext) {
    const result: number =
      await tx.$queryRaw`SELECT count(*) FROM attendee WHERE "attendancePoolId" = ${attendancePoolId} FOR UPDATE`

    return result
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

  private parse(unparsedAttendee: UnparsedAttendee, user: User): Attendee
  private parse(unparsedAttendee: UnparsedAttendee, user?: undefined): Omit<Attendee, "user">
  private parse(unparsedAttendee: UnparsedAttendee, user?: User): Attendee | Omit<Attendee, "user"> {
    const parsedSelections = unparsedAttendee.selections
      ? AttendeeSelectionResponsesSchema.parse(unparsedAttendee.selections)
      : []

    return {
      ...unparsedAttendee,
      user,
      selections: parsedSelections,
    }
  }

  async reserveAttendee(attendeeId: AttendeeId) {
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
