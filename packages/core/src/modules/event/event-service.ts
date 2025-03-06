import type { AttendanceEventDetail, AttendanceWrite, Event, EventId, EventWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service"
import type { EventCompanyService } from "./event-company-service.js"
import { EventNotFoundError } from "./event-error"
import type { EventHostingGroupService } from "./event-hosting-group-service"
import type { EventRepository } from "./event-repository.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(page: Pageable): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getEventsByGroupId(groupId: string, page: Pageable): Promise<Event[]>
  addAttendance(eventId: EventId, obj: Partial<AttendanceWrite>): Promise<Event | null>
  getAttendanceDetail(id: EventId): Promise<AttendanceEventDetail>
}

export class EventServiceImpl implements EventService {
  private readonly eventRepository: EventRepository
  private readonly attendanceService: AttendanceService
  private readonly eventCompanyService: EventCompanyService
  private readonly eventHostingGroupService: EventHostingGroupService

  constructor(
    eventRepository: EventRepository,
    attendanceService: AttendanceService,
    eventCompanyService: EventCompanyService,
    eventHostingGroupService: EventHostingGroupService
  ) {
    this.eventRepository = eventRepository
    this.attendanceService = attendanceService
    this.eventCompanyService = eventCompanyService
    this.eventHostingGroupService = eventHostingGroupService
  }

  async addAttendance(eventId: EventId, obj: AttendanceWrite) {
    const attendance = await this.attendanceService.create(obj)
    const event = this.eventRepository.addAttendance(eventId, attendance.id)

    return event
  }

  async createEvent(eventCreate: EventWrite): Promise<Event> {
    const event = await this.eventRepository.create(eventCreate)
    return event
  }

  async getEvents(page: Pageable): Promise<Event[]> {
    const events = await this.eventRepository.getAll(page)
    return events
  }

  async getEventsByUserAttending(userId: string): Promise<Event[]> {
    const events = await this.eventRepository.getAllByUserAttending(userId)
    return events
  }

  async getEventsByGroupId(groupId: string, page: Pageable): Promise<Event[]> {
    const events = await this.eventRepository.getAllByHostingGroupId(groupId, page)
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

  async getAttendanceDetail(id: EventId): Promise<AttendanceEventDetail> {
    const event = await this.getEventById(id)
    const eventHostingGroups = await this.eventHostingGroupService.getHostingGroupsForEvent(event.id)
    const eventCompanies = await this.eventCompanyService.getCompaniesByEventId(event.id)
    const attendance = event.attendanceId ? await this.attendanceService.getById(event.attendanceId) : null

    return {
      event,
      attendance,
      eventHostingGroups,
      eventCompanies,
    }
  }
}
