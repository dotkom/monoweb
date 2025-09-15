import type { DBHandle } from "@dotkomonline/db"
import type {
  AttendanceId,
  CompanyId,
  Event,
  EventFilterQuery,
  EventId,
  EventWrite,
  GroupId,
  UserId,
} from "@dotkomonline/types"
import { FailedPreconditionError, NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { EventRepository } from "./event-repository"

export interface EventService {
  createEvent(handle: DBHandle, eventCreate: EventWrite): Promise<Event>
  /**
   * Soft-delete an event by setting its status to `DELETED`.
   */
  deleteEvent(handle: DBHandle, eventId: EventId): Promise<Event>
  updateEvent(handle: DBHandle, eventId: EventId, data: Partial<EventWrite>): Promise<Event>
  updateEventOrganizers(
    handle: DBHandle,
    eventId: EventId,
    hostingGroups: Set<GroupId>,
    companies: Set<CompanyId>
  ): Promise<Event>
  updateEventAttendance(handle: DBHandle, eventId: EventId, attendanceId: AttendanceId): Promise<Event>
  updateEventParent(handle: DBHandle, eventId: EventId, parentEventId: EventId | null): Promise<Event>
  findEvents(handle: DBHandle, query: EventFilterQuery, page?: Pageable): Promise<Event[]>
  findEventsByAttendingUserId(
    handle: DBHandle,
    userId: UserId,
    query: EventFilterQuery,
    page?: Pageable
  ): Promise<Event[]>
  findByParentEventId(handle: DBHandle, parentEventId: EventId): Promise<Event[]>
  findEventById(handle: DBHandle, eventId: EventId): Promise<Event | null>
  findUnansweredByUser(handle: DBHandle, userId: UserId): Promise<Event[]>
  /**
   * Get an event by its id
   *
   * @throws {NotFoundError} if the event does not exist
   */
  getEventById(handle: DBHandle, eventId: EventId): Promise<Event>
  getByAttendance(handle: DBHandle, attendanceId: AttendanceId): Promise<Event>
}

export function getEventService(eventRepository: EventRepository): EventService {
  return {
    async createEvent(handle, eventCreate) {
      return await eventRepository.create(handle, eventCreate)
    },
    async deleteEvent(handle, eventId) {
      return await eventRepository.delete(handle, eventId)
    },
    async updateEvent(handle, eventId, data) {
      return await eventRepository.update(handle, eventId, data)
    },
    async findEvents(handle, query, page) {
      return await eventRepository.findMany(handle, query, page ?? { take: 20 })
    },
    async findByParentEventId(handle, parentEventId) {
      return await eventRepository.findByParentEventId(handle, parentEventId)
    },
    async findEventById(handle, eventId) {
      return await eventRepository.findById(handle, eventId)
    },
    async findUnansweredByUser(handle, userId) {
      return await eventRepository.findUnansweredByUser(handle, userId)
    },
    async getEventById(handle, eventId) {
      const event = await eventRepository.findById(handle, eventId)
      if (!event) {
        throw new NotFoundError(`Event(ID=${eventId}) not found`)
      }
      return event
    },
    async getByAttendance(handle, attendanceId) {
      const event = await eventRepository.findByAttendanceId(handle, attendanceId)
      if (event === null) {
        throw new NotFoundError(`Event(AttendanceId=${attendanceId}) not found`)
      }
      return event
    },
    async findEventsByAttendingUserId(handle, userId, query, page) {
      return await eventRepository.findByAttendingUserId(handle, userId, query, page ?? { take: 20 })
    },
    async updateEventOrganizers(handle, eventId, hostingGroups, companies) {
      const event = await this.getEventById(handle, eventId)
      // The easiest way to determine which elements to add and remove is to use basic set theory. The difference of a
      // set A from B (A - B) is the set of elements that are in A, but not in B.
      const eventHostingGroups = new Set(event.hostingGroups.map((it) => it.slug))
      await eventRepository.addEventHostingGroups(handle, eventId, hostingGroups.difference(eventHostingGroups))
      await eventRepository.deleteEventHostingGroups(handle, eventId, eventHostingGroups.difference(hostingGroups))

      const eventCompanies = new Set(event.companies.map((it) => it.id))
      await eventRepository.addEventCompanies(handle, eventId, companies.difference(eventCompanies))
      await eventRepository.deleteEventCompanies(handle, eventId, eventCompanies.difference(companies))

      return await this.getEventById(handle, eventId)
    },
    async updateEventAttendance(handle, eventId, attendanceId) {
      const event = await this.getEventById(handle, eventId)
      return await eventRepository.updateEventAttendance(handle, event.id, attendanceId)
    },
    async updateEventParent(handle, eventId, parentEventId) {
      if (parentEventId === eventId) {
        throw new FailedPreconditionError(`Event(ID=${eventId}) cannot be assigned itself as a parent.`)
      }
      const event = await this.getEventById(handle, eventId)
      if (parentEventId === null) {
        return await eventRepository.updateEventParent(handle, event.id, null)
      }
      const parentEvent = await this.getEventById(handle, parentEventId)
      // NOTE: This check ensures two things:
      // 1. that we do not create circular references
      // 2. that the max-height of the event tree is 2 (aka, only one level of nesting)
      if (parentEvent.parentId !== null) {
        throw new FailedPreconditionError(
          `Event(ID=${event.id}) cannot be assigned parent, as parent Event(ID=${parentEvent.id}) already has a parent.`
        )
      }
      return await eventRepository.updateEventParent(handle, event.id, parentEvent.id)
    },
  }
}
