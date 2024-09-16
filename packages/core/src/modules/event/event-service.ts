import type { DashboardEventDetail, WebEventDetail, AttendanceWrite, Event, EventId, EventWrite } from "@dotkomonline/types"
import type { Cursor } from "../../utils/db-utils"
import { AttendanceNotFound } from "../attendance/attendance-error"
import type { AttendancePoolService } from "../attendance/attendance-pool-service"
import type { AttendanceService } from "../attendance/attendance-service"
import type { EventCommitteeService } from "./event-committee-service"
import type { EventCompanyService } from "./event-company-service.js"
import { EventNotFoundError } from "./event-error"
import type { EventRepository } from "./event-repository.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Event[]>
  addAttendance(eventId: EventId, obj: Partial<AttendanceWrite>): Promise<Event | null>
  getWebDetail(id: EventId): Promise<WebEventDetail>
  getDashboardDetail(id: EventId): Promise<DashboardEventDetail>
}

export class EventServiceImpl implements EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendanceService: AttendanceService,
    private readonly attendancePoolService: AttendancePoolService,
    private readonly eventCommitteeService: EventCommitteeService,
    private readonly eventCompanyService: EventCompanyService
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

  async getDashboardDetail(id: EventId): Promise<DashboardEventDetail> {
    const event = await this.getEventById(id)
    const eventCommittees = await this.eventCommitteeService.getCommitteesForEvent(event.id)

    if (event.attendanceId !== null) {
      const attendance = await this.attendanceService.getById(event.attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(event.attendanceId)
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

  async getWebDetail(id: EventId): Promise<WebEventDetail> {
    const event = await this.getEventById(id)
    const eventCommittees = await this.eventCommitteeService.getCommitteesForEvent(event.id)
    const eventCompanies = await this.eventCompanyService.getCompaniesByEventId(event.id, 999)

    console.log(`event ${id}: ${event.title} and attendandeId: ${event.attendanceId}`)

    if (!event.attendanceId) {
      return {
        hasAttendance: false,
        event,
        eventCommittees: eventCommittees,
        eventCompanies,
      }
    }

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
      eventCompanies,
    }
  }
}
