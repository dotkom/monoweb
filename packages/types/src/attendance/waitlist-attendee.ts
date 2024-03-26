import { z } from "zod"

export const WaitlistAttendeeSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),

  attendanceId: z.string().ulid(),
  userId: z.string().ulid(),
  position: z.number(),
  isPunished: z.boolean(),
  registeredAt: z.date(),

  studyYear: z.number().int(),

  active: z.boolean(),

  attendancePoolId: z.string().ulid(),

  name: z.string(),
})

export const WaitlistAttendeeWriteSchema = WaitlistAttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type WaitlistAttendee = z.infer<typeof WaitlistAttendeeSchema>
export type WaitlistAttendeeWrite = z.infer<typeof WaitlistAttendeeWriteSchema>
export type WaitlistAttendeeId = WaitlistAttendee["id"]
