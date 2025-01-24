import { z } from "zod"
import type { User } from "../user"

export const ExtraChoice = z.object({
  questionId: z.string(),
  choiceId: z.string(),
  choiceName: z.string(),
  questionName: z.string(),
})

export const ExtrasChoices = z.array(ExtraChoice)

export const AttendeeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  attendanceId: z.string().uuid(),
  attendancePoolId: z.string().uuid(),
  userId: z.string(),

  attended: z.boolean(),
  extrasChoices: ExtrasChoices,
  registeredAt: z.date(),

  firstName: z.string(),
  lastName: z.string(),
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
export type ExtrasChoices = z.infer<typeof ExtrasChoices>
export type QrCodeRegistrationAttendee = { attendee: Attendee; user: User; alreadyAttended: boolean }
