import type { JobName } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { attemptReserveAttendeePayload } from "./attempt-reserve-attendee"

export const PayloadHandler = {
  AttemptReserveAttendee: attemptReserveAttendeePayload,
} satisfies Record<
  JobName,
  {
    schema: unknown
    parse: (payload: JsonValue) => unknown
    output: unknown
  }
>
