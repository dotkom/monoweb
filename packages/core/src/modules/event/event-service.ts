import {
  type User,
  type AttendancePool,
  type AttendanceWithUser,
  type AttendancePoolWrite,
  type AttendeeUser,
  type Event,
  type EventId,
  type EventWrite,
} from "@dotkomonline/types"
import { type AttendanceRepository } from "./attendance-repository.js"
import { type EventInsert } from "./event-repository"
import { type EventRepository } from "./event-repository.js"
import { NotFoundError } from "../../errors/errors"
import { type Cursor } from "../../utils/db-utils"
import { type UserService } from "../user/user-service.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  createAttendance(eventId: EventId, attendanceWrite: AttendancePoolWrite): Promise<AttendancePool>
  listAttendance(eventId: EventId): Promise<AttendanceWithUser[]>
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

  async createAttendance(eventId: EventId, attendanceCreate: AttendancePoolWrite): Promise<AttendancePool> {
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

  async listAttendance(eventId: EventId): Promise<AttendanceWithUser[]> {
    const attendances = await this.attendanceRepository.getPoolByEventId(eventId)

    const result: AttendanceWithUser[] = []

    for (const attendance of attendances) {
      const ids = attendance.attendees.map((attendee) => attendee.userId)
      if (ids.length === 0) {
        result.push({
          ...attendance,
          attendees: [],
        })
        continue
      }

      const users: User[] = (await Promise.all(ids.map(async (id) => this.userService.getUserById(id)))).filter(
        (user): user is User => Boolean(user)
      )

      const mergedUsers: AttendeeUser[] = users.map((user) => {
        const attendee = attendance.attendees.find((attendee) => attendee.userId === user.id)
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
}
