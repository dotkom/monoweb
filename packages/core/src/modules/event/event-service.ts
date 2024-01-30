import {
  AttendanceWithAuthData,
  AttendeeWithAuthData,
  type Attendance,
  type AttendanceWrite,
  type Event,
  type EventId,
  type EventWrite,
} from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { type Cursor } from "../../utils/db-utils"
import { UserService } from "../user/user-service.js"
import { type AttendanceRepository } from "./attendance-repository.js"
import { type EventInsert } from "./event-repository"
import { type EventRepository } from "./event-repository.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  createAttendance(eventId: EventId, attendanceWrite: AttendanceWrite): Promise<Attendance>
  listAttendance(eventId: EventId): Promise<AttendanceWithAuthData[]>
  createWaitlist(eventId: EventId): Promise<Attendance>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly userService: UserService
  ) {}

  async createEvent(eventCreate: EventWrite): Promise<Event> {
    const toInsert: EventInsert = {
      ...eventCreate,
      extras: JSON.stringify(eventCreate.extras),
    }

    const event = await this.eventRepository.create(toInsert)
    return event
  }

  async getEvents(take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAll(take, cursor)
    return events
  }

  async getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAllByCommitteeId(committeeId, take, cursor)
    return events
  }

  async getEventById(id: EventId): Promise<Event> {
    const event = await this.eventRepository.getById(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }
    return event
  }

  async updateEvent(id: EventId, eventUpdate: Omit<EventWrite, "id">): Promise<Event> {
    const toInsert: EventInsert = {
      ...eventUpdate,
      extras: JSON.stringify(eventUpdate.extras),
    }
    const event = await this.eventRepository.update(id, toInsert)
    return event
  }

  async createAttendance(eventId: EventId, attendanceCreate: AttendanceWrite): Promise<Attendance> {
    const attendance = await this.attendanceRepository.create({
      ...attendanceCreate,
      eventId,
    })
    return attendance
  }

  async deleteAttendance(attendanceId: string): Promise<boolean> {
    const attendance = await this.attendanceRepository.delete(attendanceId)
    if (attendance.numDeletedRows === BigInt(1)) {
      return true
    }
    return false
  }

  async listAttendance(eventId: EventId): Promise<AttendanceWithAuthData[]> {
    const attendances = await this.attendanceRepository.getByEventId(eventId)

    const result: AttendanceWithAuthData[] = []

    for (const attendance of attendances) {
      const ids = attendance.attendees.map((attendee) => attendee.userCognitoSub)
      if (ids.length === 0) {
        result.push({
          ...attendance,
          attendees: [],
        })
        continue
      }

      const users = await this.userService.getUserBySubjectIDP(ids)

      if (!users || users.length !== ids.length) {
        throw new Error("Not all users were found at IDP")
      }

      const mergedUsers: AttendeeWithAuthData[] = users.map((user) => {
        const attendee = attendance.attendees.find((attendee) => attendee.userCognitoSub === user.subject)
        if (!attendee) {
          throw new Error("Attendee not found")
        }
        return {
          ...attendee,
          ...user,
        }
      })

      result.push({
        ...attendance,
        attendees: mergedUsers,
      })
    }

    return result
  }

  async createWaitlist(eventId: EventId): Promise<Attendance> {
    const event = await this.getEventById(eventId)
    if (event.waitlist !== null) {
      throw new Error(`Attempted to create waitlist for event ${eventId}`)
    }
    const waitlist = await this.attendanceRepository.create({
      eventId,
      start: new Date(),
      end: new Date(),
      deregisterDeadline: new Date(),
      limit: 999999,
      min: 0,
      max: 0,
    })
    await this.eventRepository.update(eventId, {
      ...event,
      waitlist: waitlist.id,
      extras: JSON.stringify(event.extras),
    })
    return waitlist
  }
}
