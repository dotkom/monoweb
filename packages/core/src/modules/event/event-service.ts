import type {
  Attendance,
  AttendancePool,
  AttendanceWrite,
  Committee,
  Event,
  EventId,
  EventWrite,
} from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import type { AttendancePoolService } from "../attendance/attendance-pool-service"
import type { AttendanceService } from "../attendance/attendance-service"
import type { EventCommitteeService } from "./event-committee-service"
import { EventNotFoundError } from "./event-error"
import type { EventRepository } from "./event-repository.js"

type ReturnType2 = {
  event: Event
  eventCommittees: Committee[]
  attendance: Attendance | null
  pools: AttendancePool[] | null
  hasAttendance: boolean
}

type ReturnType =
  | {
      hasAttendance: false
      event: Event
      eventCommittees: Committee[]
    }
  | {
      hasAttendance: true
      event: Event
      eventCommittees: Committee[]
      attendance: Attendance
      pools: AttendancePool[]
    }

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  addAttendance(eventId: EventId, obj: Partial<AttendanceWrite>): Promise<Event | null>
  getWebEventDetailsPageData(id: EventId): Promise<ReturnType>
  getEventDetailsPageData(id: EventId): Promise<ReturnType2>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceService: AttendanceService,
    private readonly attendancePoolService: AttendancePoolService,
    private readonly eventCommitteeService: EventCommitteeService
  ) {}

  async addAttendance(eventId: EventId, obj: AttendanceWrite) {
    const attendance = await this.attendanceService.create(obj)
    const event = this.eventRepository.addAttendance(eventId, attendance.id)

    return event
  }

  async createEvent(eventCreate: EventWrite): Promise<Event> {
    const event = await this.eventRepository.create(eventCreate)
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
    const event = await this.eventRepository.update(id, eventUpdate)
    return event
  }

  async getEventDetailsPageData(id: EventId): Promise<ReturnType2> {
    const event = await this.getEventById(id)
    const eventCommittees = await this.eventCommitteeService.getCommitteesForEvent(event.id)

    if (event.attendanceId !== null) {
      const attendance = await this.attendanceService.getById(event.attendanceId)
      if (!attendance) {
        throw new Error("Attendance not found")
      }

      const pools = await this.attendancePoolService.getByAttendanceId(attendance.id)

      return {
        event,
        eventCommittees,
        attendance,
        pools,
        hasAttendance: true,
      }
    }

    return {
      event,
      eventCommittees: eventCommittees,
      attendance: null,
      pools: null,
      hasAttendance: false,
    }
  }

  async getWebEventDetailsPageData(id: EventId): Promise<ReturnType> {
    const event = await this.getEventById(id)
    const eventCommittees = await this.eventCommitteeService.getCommitteesForEvent(event.id)

    if (event.attendanceId !== null) {
      const attendance = await this.attendanceService.getById(event.attendanceId)
      if (!attendance) {
        throw new Error("Attendance not found")
      }

      const pools = await this.attendancePoolService.getByAttendanceId(attendance.id)

      return {
        hasAttendance: true,
        event,
        eventCommittees,
        attendance,
        pools,
      }
    }

    return {
      hasAttendance: false,
      event,
      eventCommittees: eventCommittees,
    }
  }
}
