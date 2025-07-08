import type { DBHandle } from "@dotkomonline/db"
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
} from "@dotkomonline/types"
import type { Pageable } from "../../query"
import type { AttendanceService } from "../attendance/attendance-service"
import type { InterestGroupService } from "../interest-group/interest-group-service"
import type { EventCompanyService } from "./event-company-service"
import { EventNotFoundError } from "./event-error"
import type { EventHostingGroupService } from "./event-hosting-group-service"
import type { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(handle: DBHandle, eventCreate: EventWrite): Promise<Event>
  updateEvent(handle: DBHandle, eventId: EventId, data: EventWrite): Promise<Event>
  /**
   * Get an event by its id
   *
   * @throws {EventNotFoundError} if the event does not exist
   */
  getEventById(handle: DBHandle, eventId: EventId): Promise<Event>
  getEvents(handle: DBHandle, page?: Pageable, filter?: EventFilter): Promise<Event[]>
  getEventsByUserAttending(handle: DBHandle, userId: string): Promise<Event[]>
  getAttendanceEventsByGroupId(handle: DBHandle, groupId: GroupId, page: Pageable): Promise<AttendanceEvent[]>
  getAttendanceEventsByInterestGroupId(
    handle: DBHandle,
    interestGroupId: InterestGroupId,
    page: Pageable
  ): Promise<AttendanceEvent[]>
  addAttendance(handle: DBHandle, eventId: EventId, data: AttendanceWrite): Promise<Event>
  getEventDetail(handle: DBHandle, eventId: EventId): Promise<EventDetail>
  setEventInterestGroups(
    handle: DBHandle,
    eventId: EventId,
    interestGroupsIds: InterestGroupId[]
  ): Promise<EventInterestGroup[]>
}

export function getEventService(
  eventRepository: EventRepository,
  attendanceService: AttendanceService,
  eventCompanyService: EventCompanyService,
  eventHostingGroupService: EventHostingGroupService,
  interestGroupService: InterestGroupService
): EventService {
  return {
    async createEvent(handle, eventCreate) {
      return await eventRepository.create(handle, eventCreate)
    },
    async updateEvent(handle, eventId, data) {
      return await eventRepository.update(handle, eventId, data)
    },
    async getEventById(handle, eventId) {
      const event = await eventRepository.getById(handle, eventId)
      if (!event) {
        throw new EventNotFoundError(eventId)
      }
      return event
    },
    async getEvents(handle, page, filter) {
      return await eventRepository.getAll(handle, page, filter)
    },
    async getEventsByUserAttending(handle, userId) {
      return await eventRepository.getAllByUserAttending(handle, userId)
    },
    async getAttendanceEventsByGroupId(handle, groupId, page) {
      const events = await eventRepository.getAllByHostingGroupId(handle, groupId, page)
      const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as AttendanceId[]
      const attendances = await attendanceService.getByIds(handle, attendanceIds)
      const attendanceEvents: AttendanceEvent[] = events.map((event) => {
        const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null
        return { ...event, attendance }
      })

      return attendanceEvents
    },
    async getAttendanceEventsByInterestGroupId(handle, interestGroupId, page) {
      const events = await eventRepository.getAllByInterestGroupId(handle, interestGroupId, page)
      const attendanceIds = events.map((event) => event.attendanceId).filter(Boolean) as AttendanceId[]
      const attendances = await attendanceService.getByIds(handle, attendanceIds)
      const attendanceEvents: AttendanceEvent[] = events.map((event) => {
        const attendance = (event.attendanceId && attendances.get(event.attendanceId)) || null
        return { ...event, attendance }
      })

      return attendanceEvents
    },
    async addAttendance(handle, eventId, data) {
      const attendance = await attendanceService.create(handle, data)
      return await eventRepository.addAttendance(handle, eventId, attendance.id)
    },
    async getEventDetail(handle, eventId) {
      const event = await this.getEventById(handle, eventId)
      const hostingCompanies = await eventCompanyService.getCompaniesByEventId(handle, event.id)
      const attendance = event.attendanceId ? await attendanceService.getById(handle, event.attendanceId) : null

      const hostingGroups = await eventHostingGroupService.getHostingGroupsForEvent(handle, event.id)
      const hostingInterestGroups = await interestGroupService.getAllByEventId(handle, event.id)

      return {
        event,
        attendance,
        hostingCompanies,
        hostingGroups,
        hostingInterestGroups,
      }
    },
    async setEventInterestGroups(handle, eventId, interestGroupsIds) {
      const eventInterestGroups = await interestGroupService.getAllByEventId(handle, eventId)
      const currentInterestGroupIds = eventInterestGroups.map((interestGroup) => interestGroup.id)

      const interestGroupsToRemove = currentInterestGroupIds.filter((groupId) => !interestGroupsIds.includes(groupId))
      const interestGroupsToAdd = interestGroupsIds.filter((groupId) => !currentInterestGroupIds.includes(groupId))

      const removePromises = interestGroupsToRemove.map(async (groupId) =>
        eventRepository.removeEventFromInterestGroup(handle, eventId, groupId)
      )

      const addPromises = interestGroupsToAdd.map(async (groupId) =>
        eventRepository.addEventToInterestGroup(handle, eventId, groupId)
      )

      await Promise.all([...removePromises, ...addPromises])

      const remainingInterestGroups = currentInterestGroupIds
        .filter((groupId) => !interestGroupsToRemove.includes(groupId))
        .concat(interestGroupsToAdd)

      return remainingInterestGroups.map((interestGroupId) => ({
        eventId,
        interestGroupId: interestGroupId,
      }))
    },
  }
}
