import { dbSchemas } from "@dotkomonline/db"
import { z } from "zod"

export const WaitlistAttendeeSchema = dbSchemas.WaitlistAttendeeSchema.extend({})

export const WaitlistAttendeeWriteSchema = WaitlistAttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type WaitlistAttendee = z.infer<typeof WaitlistAttendeeSchema>
export type WaitlistAttendeeWrite = z.infer<typeof WaitlistAttendeeWriteSchema>
export type WaitlistAttendeeId = WaitlistAttendee["id"]
