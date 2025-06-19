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
import { AttendeeNotFoundError, AttendeeWriteError } from "./attendee-error"

type UnparsedAttendee = Omit<Attendee, "user" | "selections"> & {
  selections?: JsonValue
}

export interface AttendeeRepository {
  create(obj: AttendeeWrite): Promise<Attendee>
  delete(id: AttendeeId): Promise<Omit<Attendee, "user">>
  getById(id: AttendeeId): Promise<Attendee>
  update(id: AttendeeId, obj: Partial<AttendeeWrite>): Promise<Attendee>
  getByAttendanceId(id: AttendanceId): Promise<Attendee[]>
  getByAttendancePoolId(id: AttendancePoolId): Promise<Attendee[]>
  getFirstUnreservedByAttendancePoolId(id: AttendancePoolId): Promise<Attendee | null>
  getByUserId(userId: UserId, attendanceId: AttendanceId): Promise<Attendee | null>
  poolHasAttendees(poolId: AttendancePoolId): Promise<boolean>
  reserveAttendee(attendeeId: AttendeeId): Promise<Attendee>
  moveFromMultiplePoolsToPool(oldPoolIds: AttendancePoolId[], newPoolId: AttendancePoolId): Promise<void>
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

    const attendee = await this.db.attendee.create({ data })
    const user = await this.userRepository.getById(attendee.userId)

    return this.parse(attendee, user)
  }

  async delete(id: AttendeeId) {
    const deletedUser = await this.db.attendee.delete({ where: { id } })

    return this.parse(deletedUser)
  }

  async getById(id: AttendeeId): Promise<Attendee> {
    const attendee = await this.db.attendee.findUnique({ where: { id } })

    if (!attendee) {
      throw new AttendeeNotFoundError(id)
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

  async update(id: AttendeeId, data: Partial<AttendeeWrite>) {
    this.validateWrite(data)

    const updatedAttendee = await this.db.attendee.update({ where: { id }, data })
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

  async reserveAttendee(id: AttendeeId) {
    const attendee = await this.db.attendee.update({
      where: {
        id,
      },
      data: {
        reserved: true,
      },
    })

    const user = await this.userRepository.getById(attendee.userId)

    return this.parse(attendee, user)
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
