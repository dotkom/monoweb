import { schemas } from "@dotkomonline/db"
import { z } from "zod"
import type { User } from "../user"
import { AttendanceQuestionResponseSchema } from "./attendance-questions"

export const AttendeeQuestionResponsesSchema = z.array(AttendanceQuestionResponseSchema)

export const AttendeeSchema = schemas.AttendeeSchema.extend({
  questionResponses: AttendeeQuestionResponsesSchema,
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
