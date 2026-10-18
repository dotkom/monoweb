import type { Attendee } from "@dotkomonline/rpc/attendance"
import { addSeconds, isAfter } from "date-fns"

export function hasRegistrationDelay(attendee: Attendee | null, now = new Date()): boolean {
  return (
    attendee !== null &&
    !attendee.registered &&
    isAfter(attendee.earliestReservationAt, now) &&
    isAfter(attendee.earliestReservationAt, addSeconds(attendee.createdAt, 1))
  )
}
