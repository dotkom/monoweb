/* eslint-disable @typescript-eslint/sort-type-constituents */
import { z } from "zod"
import { UserSchema } from "../user"

export const ExtraChoice = z.object({
  id: z.string(),
  choice: z.string(),
})

export const ExtrasChoices = z.array(ExtraChoice)

export const AttendeeSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  attendanceId: z.string().ulid(),
  attendancePoolId: z.string().ulid(),
  userId: z.string().ulid(),

  attended: z.boolean(),
  extrasChoices: ExtrasChoices,
  registeredAt: z.date(),
})

export const AttendeeWriteSchema = AttendeeSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendee = z.infer<typeof AttendeeSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export type AttendeeId = Attendee["id"]
export const AttendeeUserSchema = AttendeeSchema.extend({ user: UserSchema })
export type AttendeeUser = z.infer<typeof AttendeeUserSchema>
