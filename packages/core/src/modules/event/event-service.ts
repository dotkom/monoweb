import { AttendanceWrite, type Event, type EventId, type EventWrite } from "@dotkomonline/types"
import { type Cursor } from "../../utils/db-utils"
import { AttendanceService } from "../attendance/attendance-service"
import { EventNotFoundError } from "./event-error"
import { type EventInsert } from "./event-repository"
import { type EventRepository } from "./event-repository.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  addAttendance(eventId: EventId, obj: Partial<AttendanceWrite>): Promise<Event | null>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceService: AttendanceService
  ) {}

  async addAttendance(eventId: EventId, obj: AttendanceWrite) {
    const attendance = await this.attendanceService.create(obj)
    const event = this.eventRepository.addAttendance(eventId, attendance.id)

    return event
  }

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

  async getEventsByUserAttending(userId: string): Promise<Event[]> {
    const events = await this.eventRepository.getAllByUserAttending(userId)
    return events
  }

  async getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAllByCommitteeId(committeeId, take, cursor)
    return events
  }

  /**
   * Get an event by its id
   *
   * @throws {EventNotFoundError} if the event does not exist
   */
  async getEventById(id: EventId): Promise<Event> {
    const event = await this.eventRepository.getById(id)
    if (!event) {
      throw new EventNotFoundError(id)
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
}
