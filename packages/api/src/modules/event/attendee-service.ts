interface AttendeeService {
  attendEvent: (eventID: string, userId: string) => Promise<Attendee>
}
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

  async canAttend(eventId: string) {
    return new Date()
  }
  async registerForEvent(userId: string, eventId: string) {
    const pools = await this.attendanceRepository.getAttendancesByEventId(eventId)
    // TODO: Find the correct attendance pool
    const pool = pools[Math.floor(Math.random() * pools.length)]
    const attendee = await this.attendanceRepository.createAttendee({ attendanceId: pool.id, userId })
    console.log(attendee)
    return attendee
  }

  async deregisterForEvent(eventId: string, userId: string) {
    return undefined
  }
  async registerForAttendance(eventId: string, userId: string, attended: boolean) {}
}
