import type {
  EventDetail,
  AttendanceWrite,
  Event,
  EventFilter,
  EventId,
  EventInterestGroup,
  EventWrite,
  InterestGroupId,
} from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service"
import type { InterestGroupService } from "../interest-group/interest-group-service"
import type { EventCompanyService } from "./event-company-service.js"
import { EventNotFoundError } from "./event-error"
import type { EventHostingGroupService } from "./event-hosting-group-service"
import type { EventRepository } from "./event-repository.js"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>
  getEventById(id: EventId): Promise<Event>
  getEvents(page?: Pageable, filter?: EventFilter): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getEventsByGroupId(groupId: string, page: Pageable): Promise<Event[]>
  getEventsByInterestGroupId(interestGroupId: string, page: Pageable): Promise<Event[]>
  addAttendance(eventId: EventId, obj: Partial<AttendanceWrite>): Promise<Event | null>
  getEventDetail(id: EventId): Promise<EventDetail>
  setEventInterestGroups(eventId: EventId, interestGroups: InterestGroupId[]): Promise<EventInterestGroup[]>
}

export class EventServiceImpl implements EventService {
  private readonly eventRepository: EventRepository
  private readonly attendanceService: AttendanceService
  private readonly eventCompanyService: EventCompanyService
  private readonly eventHostingGroupService: EventHostingGroupService
  private readonly interestGroupService: InterestGroupService

  constructor(
    eventRepository: EventRepository,
    attendanceService: AttendanceService,
    eventCompanyService: EventCompanyService,
    eventHostingGroupService: EventHostingGroupService,
    interestGroupService: InterestGroupService
  ) {
    this.eventRepository = eventRepository
    this.attendanceService = attendanceService
    this.eventCompanyService = eventCompanyService
    this.eventHostingGroupService = eventHostingGroupService
    this.interestGroupService = interestGroupService
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

  async getEvents(page?: Pageable, filter?: EventFilter): Promise<Event[]> {
    const events = await this.eventRepository.getAll(page, filter)
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

  async getEventsByInterestGroupId(interestGroupId: string, page: Pageable): Promise<Event[]> {
    const events = await this.eventRepository.getAllByInterestGroupId(interestGroupId, page)
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
    return await this.eventRepository.update(id, eventUpdate)
  }

  async getEventDetail(id: EventId): Promise<EventDetail> {
    const event = await this.getEventById(id)
    const hostingCompanies = await this.eventCompanyService.getCompaniesByEventId(event.id)
    const attendance = event.attendanceId ? await this.attendanceService.getById(event.attendanceId) : null

    const hostingGroups = await this.eventHostingGroupService.getHostingGroupsForEvent(event.id)
    const hostingInterestGroups = await this.interestGroupService.getAllByEventId(event.id)

    return {
      event,
      attendance,
      hostingCompanies,
      hostingGroups,
      hostingInterestGroups,
    }
  }

  async setEventInterestGroups(eventId: EventId, interestGroups: InterestGroupId[]): Promise<EventInterestGroup[]> {
    const eventInterestGroups = await this.interestGroupService.getAllByEventId(eventId)
    const currentInterestGroupIds = eventInterestGroups.map((interestGroup) => interestGroup.id)

    const interestGroupsToRemove = currentInterestGroupIds.filter((groupId) => !interestGroups.includes(groupId))
    const interestGroupsToAdd = interestGroups.filter((groupId) => !currentInterestGroupIds.includes(groupId))

    const removePromises = interestGroupsToRemove.map(async (groupId) =>
      this.eventRepository.removeEventFromInterestGroup(eventId, groupId)
    )

    const addPromises = interestGroupsToAdd.map(async (groupId) =>
      this.eventRepository.addEventToInterestGroup(eventId, groupId)
    )

    await Promise.all([...removePromises, ...addPromises])

    const remainingInterestGroups = currentInterestGroupIds
      .filter((groupId) => !interestGroupsToRemove.includes(groupId))
      .concat(interestGroupsToAdd)

    return remainingInterestGroups.map((interestGroupId) => ({
      eventId,
      interestGroupId: interestGroupId,
    }))
  }
}
