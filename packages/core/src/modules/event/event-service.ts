import type {
  AttendanceEvent,
  AttendanceId,
  AttendanceWrite,
  Event,
  EventDetail,
  EventFilter,
  EventId,
  EventInterestGroup,
  EventWrite,
  GroupId,
  InterestGroupId,
  UserId,
} from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service"
import type { InterestGroupService } from "../interest-group/interest-group-service"
import type { EventCompanyService } from "./event-company-service"
import { EventNotFoundError } from "./event-error"
import type { EventHostingGroupService } from "./event-hosting-group-service"
import type { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>
  updateEvent(eventId: EventId, data: EventWrite): Promise<Event>
  /**
   * Get an event by its id
   *
   * @throws {EventNotFoundError} if the event does not exist
   */
  getEventById(eventId: EventId): Promise<Event>
  getEvents(page?: Pageable, filter?: EventFilter): Promise<Event[]>
  getEventsByUserAttending(userId: string): Promise<Event[]>
  getAttendanceEventsByGroupId(groupId: GroupId, page: Pageable): Promise<AttendanceEvent[]>
  getAttendanceEventsByInterestGroupId(interestGroupId: InterestGroupId, page: Pageable): Promise<AttendanceEvent[]>
  addAttendance(eventId: EventId, data: AttendanceWrite): Promise<Event>
  getEventDetail(eventId: EventId): Promise<EventDetail>
  setEventInterestGroups(eventId: EventId, interestGroupsIds: InterestGroupId[]): Promise<EventInterestGroup[]>
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

  async addAttendance(eventId: EventId, data: AttendanceWrite) {
    const attendance = await this.attendanceService.create(data)
    const event = await this.eventRepository.addAttendance(eventId, attendance.id)

    return event
  }

  async createEvent(eventCreate: EventWrite) {
    const event = await this.eventRepository.create(eventCreate)
    return event
  }

  async getEvents(page?: Pageable, filter?: EventFilter) {
    const events = await this.eventRepository.getAll(page, filter)
    return events
  }

  async getEventsByUserAttending(userId: UserId) {
    const events = await this.eventRepository.getAllByUserAttending(userId)
    return events
  }

  async getAttendanceEventsByGroupId(groupId: GroupId, page: Pageable) {
    const events = await this.eventRepository.getAllByHostingGroupId(groupId, page)

    const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as AttendanceId[]
    const attendances = await this.attendanceService.getByIds(attendanceIds)

    const attendanceEvents: AttendanceEvent[] = events.map((event) => {
      const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null

      return { ...event, attendance }
    })

    return attendanceEvents
  }

  async getAttendanceEventsByInterestGroupId(interestGroupId: InterestGroupId, page: Pageable) {
    const events = await this.eventRepository.getAllByInterestGroupId(interestGroupId, page)

    const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as AttendanceId[]
    const attendances = await this.attendanceService.getByIds(attendanceIds)

    const attendanceEvents: AttendanceEvent[] = events.map((event) => {
      const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null

      return { ...event, attendance }
    })

    return attendanceEvents
  }

  async getEventById(eventId: EventId) {
    const event = await this.eventRepository.getById(eventId)
    if (!event) {
      throw new EventNotFoundError(eventId)
    }
    return event
  }

  async updateEvent(eventId: EventId, data: EventWrite) {
    return await this.eventRepository.update(eventId, data)
  }

  async getEventDetail(eventId: EventId) {
    const event = await this.getEventById(eventId)
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

  async setEventInterestGroups(eventId: EventId, interestGroups: InterestGroupId[]) {
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
