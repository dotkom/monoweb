import { z } from "zod"
import { AttendancePoolSchema } from "./attendance-pool"
import { AttendeeSchema } from "./attendee"
import { UserSchema } from "../user"

export const AttendancePoolWithNumAttendees = AttendancePoolSchema.omit({ attendees: true })
  .merge(
    z.object({
      numAttendees: z.number(),
    })
  )
  .array()

export const AttendeesWithUser = AttendeeSchema.merge(UserSchema)

export type AttendancePoolWithNumAttendees = z.infer<typeof AttendancePoolWithNumAttendees>
export type AttendeeWithUser = z.infer<typeof AttendeesWithUser>
