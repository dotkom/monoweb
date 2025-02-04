import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import type { User } from "../user/user"
import { AttendanceSelectionResponseSchema } from "./attendance-selections"

export const AttendeeSelectionResponsesSchema = z.array(AttendanceSelectionResponseSchema)

export const AttendeeSchema = schemas.AttendeeSchema.extend({
  selectionResponses: AttendeeSelectionResponsesSchema,
})

export const AttendeeWriteSchema = AttendeeSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]
export type QrCodeRegistrationAttendee = { attendee: Attendee; user: User; alreadyAttended: boolean }
