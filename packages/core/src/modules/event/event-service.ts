import type {
  AttendanceWrite,
  DashboardEventDetail,
  Event,
  EventId,
  EventWrite,
  WebEventDetail,
} from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { AttendanceNotFound } from "../attendance/attendance-error"
import type { AttendancePoolService } from "../attendance/attendance-pool-service"
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
  getWebDetail(id: EventId): Promise<WebEventDetail>
  getDashboardDetail(id: EventId): Promise<DashboardEventDetail>
}

export class EventServiceImpl implements EventService {
  private readonly eventRepository: EventRepository
  private readonly attendanceService: AttendanceService
  private readonly attendancePoolService: AttendancePoolService
  private readonly eventCompanyService: EventCompanyService
  private readonly eventHostingGroupService: EventHostingGroupService

  constructor(
    eventRepository: EventRepository,
    attendanceService: AttendanceService,
    attendancePoolService: AttendancePoolService,
    eventCompanyService: EventCompanyService,
    eventHostingGroupService: EventHostingGroupService
  ) {
    this.eventRepository = eventRepository
    this.attendanceService = attendanceService
    this.attendancePoolService = attendancePoolService
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

  async getDashboardDetail(id: EventId): Promise<DashboardEventDetail> {
    const event = await this.getEventById(id)
    const eventHostingGroups = await this.eventHostingGroupService.getHostingGroupsForEvent(event.id)

    if (event.attendanceId !== null) {
      const attendance = await this.attendanceService.getById(event.attendanceId)
      if (!attendance) {
        throw new AttendanceNotFound(event.attendanceId)
      }

      const pools = await this.attendancePoolService.getByAttendanceId(attendance.id)

      return {
        event,
        eventHostingGroups,
        attendance,
        pools,
        hasAttendance: true,
      }
    }

    return {
      event,
      eventHostingGroups,
      attendance: null,
      pools: null,
      hasAttendance: false,
    }
  }

  async getWebDetail(id: EventId): Promise<WebEventDetail> {
    const event = await this.getEventById(id)
    const eventHostingGroups = await this.eventHostingGroupService.getHostingGroupsForEvent(event.id)
    const eventCompanies = await this.eventCompanyService.getCompaniesByEventId(event.id)

    console.log(`event ${id}: ${event.title} and attendandeId: ${event.attendanceId}`)

    if (!event.attendanceId) {
      return {
        hasAttendance: false,
        event,
        eventHostingGroups,
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
      eventHostingGroups,
      attendance,
      pools,
      eventCompanies,
    }
  }
}
