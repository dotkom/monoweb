import { AttendanceSchema, UserSchema } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { z } from "zod"
import { JobPayloadValidationError } from "../job-error"

const schema = z.object({
  userId: UserSchema.shape.id,
  attendanceId: AttendanceSchema.shape.id,
})

const output = schema._output

const parse = (payload: JsonValue) => {
  const parsedPayload = schema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new JobPayloadValidationError(
      `Invalid payload for AttemptReserveAttendee job: ${parsedPayload.error.message}`
    )
  }

  return parsedPayload.data
}

export const attemptReserveAttendeePayload = { schema, parse, output }
