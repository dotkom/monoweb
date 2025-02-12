import { dbSchemas } from "@dotkomonline/db"
import { z } from "zod"
import type { User } from "../user"

export const ExtraChoice = z.object({
  questionId: z.string(),
  choiceId: z.string(),
  choiceName: z.string(),
  questionName: z.string(),
})

export const ExtrasChoicesSchema = z.array(ExtraChoice)

export const AttendeeSchema = dbSchemas.AttendeeSchema.extend({
  extrasChoices: ExtrasChoicesSchema,
})

export const AttendeeWriteSchema = AttendeeSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]
export type ExtraChoice = z.infer<typeof ExtraChoice>
export type ExtrasChoices = z.infer<typeof ExtrasChoicesSchema>
export type QrCodeRegistrationAttendee = { attendee: Attendee; user: User; alreadyAttended: boolean }
