import type { Attendee } from "@dotkomonline/rpc/attendance"
import { addSeconds, isAfter } from "date-fns"

export function hasRegistrationDelay(attendee: Attendee | null, now = new Date()): boolean {
  return (
    attendee !== null &&
    attendee.registeredAt === null &&
    isAfter(attendee.registrationEligibleAt, now) &&
    isAfter(attendee.registrationEligibleAt, addSeconds(attendee.createdAt, 1))
  )
}
