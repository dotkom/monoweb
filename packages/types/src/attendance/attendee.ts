import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { type User, UserFlagSchema } from "../user/user"
import { AttendanceSelectionResponseSchema } from "./attendance-selections"

export const AttendeeSelectionResponsesSchema = z.array(AttendanceSelectionResponseSchema)

export const AttendeeSchema = schemas.AttendeeSchema.extend({
  selections: AttendeeSelectionResponsesSchema,
  userFlags: UserFlagSchema,
})

export const AttendeeWriteSchema = AttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  selections: true,
  attended: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]
export type AttendeeSelectionResponse = z.infer<typeof AttendeeSelectionResponsesSchema>
export type QrCodeRegistrationAttendee = { attendee: Attendee; user: User; alreadyAttended: boolean }
