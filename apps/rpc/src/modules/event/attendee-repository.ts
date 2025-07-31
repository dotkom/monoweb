import type { DBHandle } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendancePoolId,
  type AttendeeId,
  AttendeeSchema,
  AttendeeSelectionResponsesSchema as AttendeeSelectionOptionSchema,
  AttendeeSelectionResponsesSchema,
  type AttendeeWrite,
  type UserId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { parseOrReport } from "../../invariant"
import { AttendeeWriteError } from "./attendee-error"

type UnparsedAttendeeWithoutUser = Omit<AttendeeWithoutUser, "selections"> & {
  selections?: JsonValue
}

export interface AttendeeRepository {
  create(handle: DBHandle, data: AttendeeWrite): Promise<AttendeeWithoutUser>
  delete(handle: DBHandle, attendeeId: AttendeeId): Promise<void>
  getById(handle: DBHandle, attendeeId: AttendeeId): Promise<AttendeeWithoutUser | null>
  update(handle: DBHandle, attendeeId: AttendeeId, data: Partial<AttendeeWrite>): Promise<AttendeeWithoutUser>
  getByAttendanceId(handle: DBHandle, attendanceId: AttendanceId): Promise<AttendeeWithoutUser[]>
  getByAttendancePoolId(handle: DBHandle, attendancePoolId: AttendancePoolId): Promise<AttendeeWithoutUser[]>
  getFirstUnreservedByAttendancePoolId(
    handle: DBHandle,
    attendancePoolId: AttendancePoolId
  ): Promise<AttendeeWithoutUser | null>
  getByUserId(handle: DBHandle, userId: UserId, attendanceId: AttendanceId): Promise<AttendeeWithoutUser | null>
  poolHasAttendees(handle: DBHandle, poolId: AttendancePoolId): Promise<boolean>
  attendanceHasAttendees(handle: DBHandle, attendanceId: AttendanceId): Promise<boolean>
  reserveAttendee(handle: DBHandle, attendeeId: AttendeeId): Promise<boolean>
  moveFromMultiplePoolsToPool(
    handle: DBHandle,
    fromPoolIds: AttendancePoolId[],
    toPoolId: AttendancePoolId
  ): Promise<void>
  removeAllSelectionResponsesForSelection(
    handle: DBHandle,
    attendanceId: AttendanceId,
    selectionId: string
  ): Promise<void>
  getAttendeeStatuses(
    handle: DBHandle,
    userId: UserId,
    attendanceIds: AttendanceId[]
  ): Promise<Map<AttendanceId, "RESERVED" | "UNRESERVED">>
  removeSelectionResponses(handle: DBHandle, selectionId: string): Promise<AttendanceId | null>
}

export function getAttendeeRepository(): AttendeeRepository {
  return {
    async create(handle, data) {
      validateWrite(data)
      const attendee = await handle.attendee.create({ data })
      return parse(attendee)
    },
    async delete(handle, attendeeId) {
      await handle.attendee.delete({ where: { id: attendeeId } })
    },
    async getById(handle, attendeeId) {
      const attendee = await handle.attendee.findUnique({ where: { id: attendeeId } })
      if (!attendee) {
        return null
      }
      return parse(attendee)
    },
    async update(handle, attendeeId, data) {
      validateWrite(data)
      const updatedAttendee = await handle.attendee.update({ where: { id: attendeeId }, data })
      return parse(updatedAttendee)
    },
    async getByAttendanceId(handle, attendanceId) {
      const attendees = await handle.attendee.findMany({
        where: { attendanceId },
        orderBy: { earliestReservationAt: "asc" },
      })
      return attendees.map(parse)
    },
    async getByAttendancePoolId(handle, attendancePoolId) {
      const attendees = await handle.attendee.findMany({
        where: { attendancePoolId },
        orderBy: { earliestReservationAt: "asc" },
      })
      return attendees.map(parse)
    },
    async getFirstUnreservedByAttendancePoolId(handle, attendancePoolId) {
      const attendee = await handle.attendee.findFirst({
        where: { attendancePoolId, reserved: false },
        orderBy: { earliestReservationAt: "asc" },
      })
      if (!attendee) {
        return null
      }
      return parse(attendee)
    },
    async getByUserId(handle, userId, attendanceId) {
      const attendee = await handle.attendee.findFirst({ where: { userId, attendanceId } })
      if (!attendee) {
        return null
      }
      return parse(attendee)
    },
    async poolHasAttendees(handle, poolId) {
      const numberOfAttendees = await handle.attendee.count({ where: { attendancePoolId: poolId } })
      return numberOfAttendees > 0
    },
    async attendanceHasAttendees(handle, attendanceId) {
      const numberOfAttendees = await handle.attendee.count({ where: { attendanceId } })
      return numberOfAttendees > 0
    },
    async reserveAttendee(handle, attendeeId) {
      const attendee = await handle.attendee.update({
        where: {
          id: attendeeId,
        },
        data: {
          reserved: true,
        },
      })
      return attendee.reserved
    },
    async moveFromMultiplePoolsToPool(handle, fromPoolIds, toPoolId) {
      await handle.attendee.updateMany({
        where: { attendancePoolId: { in: fromPoolIds } },
        data: { attendancePoolId: toPoolId },
      })
    },
    async removeAllSelectionResponsesForSelection(handle, attendanceId, selectionId) {
      const attendees = (await handle.attendee.findMany({
        where: { attendanceId },
        select: { id: true, selections: true },
      })) as Pick<UnparsedAttendeeWithoutUser, "id" | "selections">[]

      const updatedRows = attendees
        .filter(({ selections }) => Array.isArray(selections) && selections.length > 0)
        .map(({ id, selections: oldSelections }) => {
          const parsedSelections = AttendeeSelectionResponsesSchema.parse(oldSelections)
          const selections = parsedSelections.filter((oldSelection) => oldSelection.selectionId !== selectionId)

          return handle.attendee.update({
            where: { id },
            data: { selections },
          })
        })
      await Promise.all(updatedRows)
    },
    async getAttendeeStatuses(handle, userId, attendanceIds) {
      const attendees = await handle.attendee.findMany({
        where: { userId, attendanceId: { in: attendanceIds } },
        select: { attendanceId: true, reserved: true },
      })
      const statusMap: Map<AttendanceId, "RESERVED" | "UNRESERVED"> = new Map()
      for (const { attendanceId, reserved } of attendees) {
        statusMap.set(attendanceId, reserved ? "RESERVED" : "UNRESERVED")
      }
      return statusMap
    },
    async removeSelectionResponses(handle, selectionId) {
      const updated = await handle.$queryRawUnsafe<{ attendanceId: AttendanceId }[]>(
        `
        UPDATE "attendee"
        SET selections = (
          SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
          FROM jsonb_array_elements(selections) AS elem
          WHERE elem->>'selectionId' <> $1
        )
        WHERE selections @> $2::jsonb
        RETURNING "attendanceId";
      `,
        selectionId,
        JSON.stringify([{ selectionId }])
      )

      return updated.at(0)?.attendanceId || null
    },
  }
}

function validateWrite(data: Partial<AttendeeWrite>) {
  if (!data.selections) {
    return
  }
  const selectionResponseParseResult = AttendeeSelectionOptionSchema.safeParse(data.selections)
  if (!selectionResponseParseResult.success) {
    throw new AttendeeWriteError("Invalid JSON data in AttendeeWrite field selectionResponses")
  }
}

function parse(unparsedAttendee: UnparsedAttendeeWithoutUser): AttendeeWithoutUser {
  const parsedSelections = unparsedAttendee.selections
    ? AttendeeSelectionResponsesSchema.parse(unparsedAttendee.selections)
    : []

  return parseOrReport(AttendeeSchema.omit({ user: true }), {
    ...unparsedAttendee,
    selections: parsedSelections,
  })
}
