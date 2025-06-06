import type { JobName } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import type { z } from "zod"
import { attemptReserveAttendeeSchema, parseAttemptReserveAttendeePayload } from "./attempt-reserve-attendee"
import { mergePoolsSchema, parseMergePoolsPayload } from "./merge-pools"

type PayloadHandler = Record<JobName, { schema: z.ZodTypeAny; parser: (payload: JsonValue) => unknown }>

export const payloadHandlers = {
  ATTEMPT_RESERVE_ATTENDEE: {
    schema: attemptReserveAttendeeSchema,
    parser: parseAttemptReserveAttendeePayload,
  },
  MERGE_POOLS: {
    schema: mergePoolsSchema,
    parser: parseMergePoolsPayload,
  },
} satisfies PayloadHandler
