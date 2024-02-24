import { AttendancePool, type AttendanceId, type Attendee, type EventId, type UserId } from "@dotkomonline/types"
import { type AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  canAttend(eventId: EventId): Promise<Date | undefined>
  registerForEvent(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  deregisterAttendee(userId: UserId, eventId: EventId): Promise<Attendee | undefined>
  registerForAttendance(userId: UserId, attendancePoolId: string, attended: boolean): Promise<Attendee | undefined>
  addChoice(eventId: string, attendancePoolId: string, questionId: string, choiceId: string): Promise<Attendee | undefined>
  createWaitlist(attendancePoolId: string): Promise<AttendancePool>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async canAttend(_eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: UserId, poolId: AttendanceId) {
    const attendee = await this.attendanceRepository.createAttendee({
      attendancePoolId: poolId,
      userId,
      attended: false,
    })
    return attendee
  }

  async deregisterAttendee(_userId: UserId, _attendanceId: AttendanceId) {
    const attendee = await this.attendanceRepository.removeAttendee(_userId, _attendanceId)
    return attendee
  }

  async registerForAttendance(_userId: UserId, _attendancePoolId: AttendanceId, _attended: boolean) {
    const attendee = await this.attendanceRepository.getAttendeeById(_userId, _attendancePoolId)
    if (!attendee) {
      throw new Error("Attendee not found")
    }
    const attendedAttendee = await this.attendanceRepository.updateAttendee(
      { ...attendee, attended: _attended },
      _userId,
      _attendancePoolId
    )
    return attendedAttendee
  }

  async addChoice(eventId: string, attendancePoolId: string, questionId: string, choiceId: string) {
    const attendee = await this.attendanceRepository.getAttendeeById(eventId, attendancePoolId)
    if (!attendee) {
      throw new Error("Attendee not found")
    }
    const choice = await this.attendanceRepository.addChoice(eventId, attendancePoolId, questionId, choiceId)
    return choice
  }

  async createWaitlist(_attendancePoolId: string) {
    const pool = await this.attendanceRepository.getPoolById(_attendancePoolId)
    if (!pool) {
      throw new Error("Pool not found")
    }

    const waitlistPool = await this.attendanceRepository.createPool({
      createdAt: new Date(),
      updatedAt: new Date(),
      waitlist: null,
      attendanceId: _attendancePoolId,
      min: 0,
      max: 0,
      limit: 999,
      eventId: pool.eventId,
      attendees: [],
    })

    return waitlistPool
  }
}
