import { AttendanceSchema, UserSchema } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { z } from "zod"
import { JobPayloadValidationError } from "../job-error"

export const attemptReserveAttendeeSchema = z.object({
  userId: UserSchema.shape.id,
  attendanceId: AttendanceSchema.shape.id,
})

export const parseAttemptReserveAttendeePayload = (payload: JsonValue) => {
  const parsedPayload = attemptReserveAttendeeSchema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new JobPayloadValidationError(
      `Invalid payload for ATTEMPT_RESERVE_ATTENDEE job: ${parsedPayload.error.message}`
    )
  }

  return parsedPayload.data
}
