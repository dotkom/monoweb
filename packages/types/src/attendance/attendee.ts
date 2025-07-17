import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { Auth0UserSchema } from "../user/user"
import { AttendanceSelectionResponseSchema } from "./attendance-selections"

export const AttendeeSelectionResponsesSchema = z.array(AttendanceSelectionResponseSchema)

export const AttendeeSchema = schemas.AttendeeSchema.extend({
  user: Auth0UserSchema,
  selections: AttendeeSelectionResponsesSchema,
})

export const AttendeeWriteSchema = AttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  user: true,
}).partial({
  selections: true,
  attended: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWithoutUser = Omit<Attendee, "user">
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]
export type AttendeeSelectionResponse = z.infer<typeof AttendeeSelectionResponsesSchema>
