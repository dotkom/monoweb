import { type AttendanceId, type Attendee, type EventId, type UserId } from "@dotkomonline/types"
import { type AttendanceRepository } from "./attendance-repository"
import { AttendeeNotFoundError } from "./attendee-error"

export interface AttendanceService {
  canAttend(eventId: EventId): Promise<Date | undefined>
  registerForEvent(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  deregisterAttendee(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  registerForAttendance(userId: UserId, attendanceId: string, attended: boolean): Promise<Attendee | undefined>
  addChoice(eventId: string, attendanceId: string, questionId: string, choiceId: string): Promise<Attendee | undefined>
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

  /**
   * Register for an attendance
   *
   * @throws {AttendeeNotFoundError} if attendee is not found
   */
  async registerForAttendance(_userId: UserId, _attendanceId: AttendanceId, _attended: boolean) {
    const attendee = await this.attendanceRepository.getAttendeeByIds(_userId, _attendanceId)
    if (!attendee) {
      throw new AttendeeNotFoundError(_userId)
    }
    const attendedAttendee = await this.attendanceRepository.updateAttendee(
      { ...attendee, attended: _attended },
      _userId,
      _attendanceId
    )
    return attendedAttendee
  }

  /**
   * Add a choice to an attendee
   *
   * @throws {AttendeeNotFoundError} if attendee is not found
   */
  async addChoice(eventId: string, attendanceId: string, questionId: string, choiceId: string) {
    const attendee = await this.attendanceRepository.getAttendeeByIds(eventId, attendanceId)
    if (!attendee) {
      throw new AttendeeNotFoundError(eventId)
    }
    const choice = await this.attendanceRepository.addChoice(eventId, attendanceId, questionId, choiceId)
    return choice
  }
}
