import { Attendee, Event, User } from "@dotkomonline/types"
import { AttendanceRepository } from "./attendee-repository"

export interface AttendService {
  canAttend: (eventId: Event["id"]) => Promise<Date | undefined>
  registerForEvent: (userId: User["id"], eventId: Event["id"]) => Promise<Attendee | undefined>
  deregisterForEvent: (userId: User["id"], eventId: Event["id"]) => Promise<Attendee | undefined>
  registerForAttendance: (eventId: Event["id"], userId: User["id"], attended: boolean) => Promise<void>
}

export class AttendServiceImpl implements AttendService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async canAttend(_eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: string, eventId: string) {
    const pools = await this.attendanceRepository.getAttendancesByEventId(eventId)
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
