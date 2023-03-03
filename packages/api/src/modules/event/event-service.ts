import { Cursor } from "@/utils/db-utils"
import { Attendance, AttendanceWrite, Event, EventWrite } from "@dotkomonline/types"

import { NotFoundError } from "../../errors/errors"
import { AttendanceRepository } from "./attendee-repository"
import { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  getEventById(id: Event["id"]): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  addAttendance(eventId: Event["id"], attendanceWrite: AttendanceWrite): Promise<Attendance>
  listAttendance(eventId: Event["id"]): Promise<Attendance[]>
  updateEvent(id: Event["id"], payload: Omit<EventWrite, "id">): Promise<Event>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceRepository: AttendanceRepository
  ) {}

  async createEvent(eventCreate: EventWrite): Promise<Event> {
    const event = await this.eventRepository.create(eventCreate)
    if (!event) {
      throw new Error("Failed to create event")
    }
    return event
  }

  async getEvents(take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAll(take, cursor)
    return events
  }

  async getEventById(id: Event["id"]): Promise<Event> {
    const event = await this.eventRepository.getById(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }
    return event
  }

  async updateEvent(id: Event["id"], eventUpdate: Omit<EventWrite, "id">): Promise<Event> {
    const event = await this.eventRepository.update(id, eventUpdate)
    if (!event) {
      throw new NotFoundError(`Could not update Event(${id})`)
    }
    return event
  }

  async addAttendance(eventId: Event["id"], attendanceCreate: AttendanceWrite): Promise<Attendance> {
    const attendance = await this.attendanceRepository.create({
      ...attendanceCreate,
      eventId,
    })
    return attendance
  }

  async listAttendance(eventId: Event["id"]): Promise<Attendance[]> {
    const attendance = await this.attendanceRepository.getById(eventId)
    return attendance
  }
}
