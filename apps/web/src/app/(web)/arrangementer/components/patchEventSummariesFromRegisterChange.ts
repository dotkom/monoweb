import type { BulkRegisterChangeEvent } from "@dotkomonline/rpc/attendance"
import type { EventWithAttendanceSummary } from "@dotkomonline/rpc/event"

export function patchEventSummariesFromRegisterChange<EventDetails extends EventWithAttendanceSummary>(
  events: EventDetails[],
  registerChangeEvent: BulkRegisterChangeEvent
): EventDetails[] {
  return events.map((eventDetails) => {
    const { attendance } = eventDetails

    if (attendance === null || attendance.id !== registerChangeEvent.attendee.attendanceId) {
      return eventDetails
    }

    let currentUserAttendee = attendance.currentUserAttendee

    if (registerChangeEvent.isCurrentUser) {
      if (registerChangeEvent.status === "deregistered") {
        currentUserAttendee = null
      } else {
        currentUserAttendee = registerChangeEvent.attendee
      }
    }

    return {
      ...eventDetails,
      attendance: {
        ...attendance,
        registeredAttendeeCount: registerChangeEvent.registeredAttendeeCount,
        currentUserAttendee,
      },
    }
  })
}
