import type { DBHandle } from "@dotkomonline/db"
import type {
  AttendanceId,
  CompanyId,
  Event,
  EventFilterQuery,
  EventId,
  EventWrite,
  GroupId,
  InterestGroupId,
  UserId,
} from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { EventNotFoundError } from "./event-error"
import type { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(handle: DBHandle, eventCreate: EventWrite): Promise<Event>
  updateEvent(handle: DBHandle, eventId: EventId, data: EventWrite): Promise<Event>
  updateEventOrganizers(
    handle: DBHandle,
    eventId: EventId,
    hostingGroups: Set<GroupId>,
    interestGroups: Set<InterestGroupId>,
    companies: Set<CompanyId>
  ): Promise<Event>
  updateEventAttendance(handle: DBHandle, eventId: EventId, attendanceId: AttendanceId): Promise<Event>
  findEvents(handle: DBHandle, query: EventFilterQuery, page?: Pageable): Promise<Event[]>
  findEventByAttendingUserId(handle: DBHandle, userId: UserId, page?: Pageable): Promise<Event[]>
  findEventById(handle: DBHandle, eventId: EventId): Promise<Event | null>
  /**
   * Get an event by its id
   *
   * @throws {EventNotFoundError} if the event does not exist
   */
  getEventById(handle: DBHandle, eventId: EventId): Promise<Event>
}

export function getEventService(eventRepository: EventRepository): EventService {
  return {
    async createEvent(handle, eventCreate) {
      return await eventRepository.create(handle, eventCreate)
    },
    async updateEvent(handle, eventId, data) {
      return await eventRepository.update(handle, eventId, data)
    },
    async findEvents(handle, query, page) {
      return await eventRepository.findMany(handle, query, page ?? { take: 20 })
    },
    async findEventById(handle, eventId) {
      return await eventRepository.findById(handle, eventId)
    },
    async getEventById(handle, eventId) {
      const event = await eventRepository.findById(handle, eventId)
      if (!event) {
        throw new EventNotFoundError(eventId)
      }
      return event
    },
    async findEventByAttendingUserId(handle, userId, page) {
      return await eventRepository.findByAttendingUserId(handle, userId, page ?? { take: 20 })
    },
    async updateEventOrganizers(handle, eventId, hostingGroups, interestGroups, companies) {
      const event = await this.getEventById(handle, eventId)
      // The easiest way to determine which elements to add and remove is to use basic set theory. The difference of a
      // set A from B (A - B) is the set of elements that are in A, but not in B.
      const eventHostingGroups = new Set(event.hostingGroups.map((it) => it.slug))
      await eventRepository.addEventHostingGroups(handle, eventId, hostingGroups.difference(eventHostingGroups))
      await eventRepository.deleteEventHostingGroups(handle, eventId, eventHostingGroups.difference(hostingGroups))

      const eventInterestGroups = new Set(event.interestGroups.map((it) => it.id))
      await eventRepository.addEventInterestGroups(handle, eventId, interestGroups.difference(eventInterestGroups))
      await eventRepository.deleteEventInterestGroups(handle, eventId, eventInterestGroups.difference(interestGroups))

      const eventCompanies = new Set(event.companies.map((it) => it.id))
      await eventRepository.addEventCompanies(handle, eventId, companies.difference(eventCompanies))
      await eventRepository.deleteEventCompanies(handle, eventId, eventCompanies.difference(companies))

      return await this.getEventById(handle, eventId)
    },
    async updateEventAttendance(handle, eventId, attendanceId) {
      const event = await this.getEventById(handle, eventId)
      return await eventRepository.updateEventAttendance(handle, event.id, attendanceId)
    },
  }
}
