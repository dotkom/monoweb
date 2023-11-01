import { AttendanceId, Attendee, EventId, UserId } from "@dotkomonline/types"
import { AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  canAttend(eventId: EventId): Promise<Date | undefined>
  registerForEvent(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  deregisterAttendee(userId: UserId, attendanceId: AttendanceId): Promise<Attendee>
  registerForAttendance(userId: UserId, attendanceId: AttendanceId, attended: boolean): Promise<Attendee | undefined>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async canAttend(_eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: UserId, eventId: EventId) {
    const pools = await this.attendanceRepository.getByEventId(eventId)
    const pool = pools[Math.floor(Math.random() * pools.length)]
    const attendee = await this.attendanceRepository.createAttendee({ attendanceId: pool.id, userId, attended: false })
    return attendee
  }

  async deregisterAttendee(_userId: UserId, _attendanceId: AttendanceId) {
    const attendee = await this.attendanceRepository.removeAttendee(_userId, _attendanceId)
    return attendee
  }

  async registerForAttendance(_userId: UserId, _attendanceId: AttendanceId, _attended: boolean) {
    const attendee = await this.attendanceRepository.getAttendeeByIds(_userId, _attendanceId)
    if (!attendee) throw new Error("Attendee not found")
    const attendedAttendee = await this.attendanceRepository.updateAttendee(
      { ...attendee, attended: _attended },
      _userId,
      _attendanceId
    )
    return attendedAttendee
  }
}
