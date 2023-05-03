import { Attendee, Event, User } from "@dotkomonline/types"
import { AttendanceRepository } from "./attendance-repository"

export interface AttendanceService {
  canAttend(eventId: Event["id"]): Promise<Date | undefined>
  registerForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>
  deregisterForEvent(userId: User["id"], eventId: Event["id"]): Promise<Attendee | undefined>
  registerForAttendance(eventId: Event["id"], userId: User["id"], attended: boolean): Promise<void>
}

export class AttendanceServiceImpl implements AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async canAttend(_eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: string, eventId: string) {
    const pools = await this.attendanceRepository.getByEventId(eventId)
    const pool = pools[Math.floor(Math.random() * pools.length)]
    const attendee = await this.attendanceRepository.createAttendee({ attendanceId: pool.id, userId })
    return attendee
  }

  async deregisterForEvent(_eventId: string, _userId: string) {
    return undefined
  }
  async registerForAttendance(_eventId: string, _userId: string, _attended: boolean) {
    return
  }
}
