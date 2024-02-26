import { type AttendeeWithUser, type EventId, type AttendancePoolWithNumAttendees } from "@dotkomonline/types"

export interface DashboardAttendanceUC {
  getAttendanceInfo(id: EventId): Promise<AttendancePoolWithNumAttendees>
  getAttendees(attendanceId: string): Promise<AttendeeWithUser[]>
}
