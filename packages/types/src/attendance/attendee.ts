import { z } from "zod"
import { UserSchema } from "../user"

export const ExtraChoice = z.object({
  id: z.string(),
  choice: z.string(),
})

export const AttendeeSchema = z.object({
  id: z.string(),
  attendancePoolId: z.string().ulid(),
  userId: z.string().ulid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attended: z.boolean(),
  extrasChoices: z.array(ExtraChoice).nullable(),
})

export const AttendeeWriteSchema = AttendeeSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]

export type AttendeeUser = z.infer<typeof AttendeeUser>
export const AttendeeUser = AttendeeSchema.merge(UserSchema)
