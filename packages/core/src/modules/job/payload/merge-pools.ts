import { AttendancePoolWriteSchema, AttendanceSchema } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { z } from "zod"
import { JobPayloadValidationError } from "../job-error"

export const mergePoolsSchema = z.object({
  attendanceId: AttendanceSchema.shape.id,
  newMergePoolData: AttendancePoolWriteSchema.partial(),
})

export const parseMergePoolsPayload = (payload: JsonValue) => {
  const parsedPayload = mergePoolsSchema.safeParse(payload)

  if (!parsedPayload.success) {
    throw new JobPayloadValidationError(`Invalid payload for MERGE_POOLS job: ${parsedPayload.error.message}`)
  }

  return parsedPayload.data
}
