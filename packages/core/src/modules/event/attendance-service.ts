import { Attendee, EventId, UserId } from "@dotkomonline/types"
import { AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  canAttend(eventId: EventId): Promise<Date | undefined>
  registerForEvent(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  deregisterForEvent(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  registerForAttendance(userId: UserId, attendanceId: string, attended: boolean): Promise<Attendee | undefined>
  addChoice(eventId: string, attendanceId: string, questionId: string, choiceId: string): Promise<Attendee | undefined>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async canAttend(_eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: string, eventId: string) {
    const pools = await this.attendanceRepository.getByEventId(eventId)
    const pool = pools[Math.floor(Math.random() * pools.length)]
    const attendee = await this.attendanceRepository.createAttendee({ attendanceId: pool.id, userId, attended: false })
    return attendee
  }

  async deregisterForEvent(_eventId: string, _userId: string) {
    return undefined
  }

  async registerForAttendance(_userId: string, _attendanceId: string, _attended: boolean) {
    const attendee = await this.attendanceRepository.getAttendeeByIds(_userId, _attendanceId)
    if (!attendee) throw new Error("Attendee not found")
    const attendedAttendee = await this.attendanceRepository.updateAttendee(
      { ...attendee, attended: _attended },
      _userId,
      _attendanceId
    )
    return attendedAttendee
  }

  async addChoice(eventId: string, attendanceId: string, questionId: string, choiceId: string) {
    const attendee = await this.attendanceRepository.getAttendeeByIds(eventId, attendanceId)
    if (!attendee) throw new Error("Attendee not found")
    const choice = await this.attendanceRepository.addChoice(eventId, attendanceId, questionId, choiceId)
    return choice
  }
}
