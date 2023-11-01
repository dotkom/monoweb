import { Attendee, Event, User } from "@dotkomonline/types"
import { AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  canAttend(eventId: Event["id"]): Promise<Date | undefined>
  registerForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>
  deregisterForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>
  registerForAttendance(userId: User["id"], attendanceId: string, attended: boolean): Promise<Attendee | undefined>
  getByUserId(userId: User["id"]): Promise<Attendee[] | undefined>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) { }

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

  async getByUserId(userId: string) {
    const lol =  await this.attendanceRepository.getByUserId(userId)
    return lol
  }
}
