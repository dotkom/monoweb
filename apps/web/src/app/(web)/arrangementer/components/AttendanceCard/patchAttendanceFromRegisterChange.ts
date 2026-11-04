import type {
  Attendance,
  AttendanceView,
  BulkRegisterChangeEvent,
  RegisterChangeEvent,
} from "@dotkomonline/rpc/attendance"

export function patchAttendanceFromRegisterChange(
  attendance: Attendance | undefined,
  update: Pick<RegisterChangeEvent, "status" | "attendee">
): Attendance | undefined
export function patchAttendanceFromRegisterChange(
  attendance: AttendanceView | undefined,
  update: Pick<BulkRegisterChangeEvent, "status" | "attendee">
): AttendanceView | undefined

export function patchAttendanceFromRegisterChange(
  attendance: AttendanceView | undefined,
  { status, attendee }: Pick<BulkRegisterChangeEvent, "status" | "attendee">
): AttendanceView | undefined {
  if (attendance === undefined) {
    return attendance
  }

  if (status === "deregistered") {
    return {
      ...attendance,
      attendees: attendance.attendees.filter((existingAttendee) => existingAttendee.id !== attendee.id),
    }
  }

  const attendeeExists = attendance.attendees.some((existingAttendee) => existingAttendee.id === attendee.id)

  if (attendeeExists) {
    return {
      ...attendance,
      attendees: attendance.attendees.map((existingAttendee) => {
        if (existingAttendee.id === attendee.id) {
          return attendee
        }

        return existingAttendee
      }),
    }
  }

  return {
    ...attendance,
    attendees: [...attendance.attendees, attendee],
  }
}
