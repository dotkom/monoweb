import { Attendance, AttendanceWrite, Event, EventWrite } from "@dotkomonline/types"

import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { AttendanceRepository } from "./attendance-repository"
import { EventCommitteeRepository } from "./event-committee-repository"
import { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(eventCreate: EventWrite, eventCommittees: string[]): Promise<Event>
  updateEvent(id: Event["id"], payload: Omit<EventWrite, "id">, committees: string[]): Promise<Event>
  getEventById(id: Event["id"]): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>

  createAttendance(eventId: Event["id"], attendanceWrite: AttendanceWrite): Promise<Attendance>
  listAttendance(eventId: Event["id"]): Promise<Attendance[]>
  createWaitlist(eventId: Event["id"]): Promise<Attendance>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly committeeOrganizerRepository: EventCommitteeRepository
  ) {}

  async createEvent(eventCreate: EventWrite, committees: string[]): Promise<Event> {
    const event = await this.eventRepository.create(eventCreate)

    if (!event) {
      throw new Error("Failed to create event")
    }

    await this.committeeOrganizerRepository.setCommittees(event.id, committees)

    return event
  }

  async getEvents(take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAll(take, cursor)

    return events
  }

  async getEventsByCommitteeId(
    committeeId: string,
    take: number,
    cursor?: { id: string; createdAt: Date } | undefined
  ): Promise<Event[]> {
    const events = await this.eventRepository.getAllByCommitteeId(committeeId, take, cursor)
    return events
  }

  async getEventById(id: Event["id"]): Promise<Event> {
    const event = await this.eventRepository.getById(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }

    const committees = await this.committeeOrganizerRepository.getAllCommittees(event.id, 999)

    return {
      ...event,
      committees: committees,
    }
  }

  async updateEvent(id: Event["id"], eventUpdate: Omit<EventWrite, "id">): Promise<Event> {
    const updatedEvent = await this.eventRepository.update(id, eventUpdate)

    if (!updatedEvent) {
      throw new NotFoundError(`Could not update Event(${id})`)
    }

    return updatedEvent
  }

  async createAttendance(eventId: Event["id"], attendanceCreate: AttendanceWrite): Promise<Attendance> {
    const attendance = await this.attendanceRepository.create({
      ...attendanceCreate,
      eventId,
    })
    return attendance
  }

  async listAttendance(eventId: Event["id"]): Promise<Attendance[]> {
    const attendance = await this.attendanceRepository.getByEventId(eventId)
    return attendance
  }

  async createWaitlist(eventId: Event["id"]): Promise<Attendance> {
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
    })
    return waitlist
  }
}
