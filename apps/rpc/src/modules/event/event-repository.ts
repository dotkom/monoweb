import type { DBHandle } from "@dotkomonline/db"
import {
  type CompanyId,
  type Event,
  type EventFilterQuery,
  type EventId,
  type EventWrite,
  type GroupId,
  type InterestGroupId,
  type UserId,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { type Pageable, pageQuery } from "../../query"

export interface EventRepository {
  create(handle: DBHandle, data: EventWrite): Promise<Event>
  update(handle: DBHandle, id: EventId, data: Partial<EventWrite>): Promise<Event>
  findById(handle: DBHandle, id: string): Promise<Event | null>
  /**
   * Find events based on a set of search criteria.
   *
   * You can query events by their IDs (for multiple events), start date range, search term, and the companies, groups,
   * or interest groups organizing the event.
   *
   * The following describes the filters in a "predicate logic" style:
   *
   * @example
   * ```ts
   * AND(
   *   id IN byId,
   *   start >= byStartDate.min,
   *   start <= byStartDate.max,
   *   title CONTAINS bySearchTerm,
   *   OR(
   *     companies.companyId IN byOrganizingCompany,
   *     hostingGroups.groupId IN byOrganizingGroup,
   *     interestGroups.interestGroupId IN byOrganizingInterestGroup
   *   )
   * )
   * ```
   *
   * NOTE: Yes, this is a monster query, but if - a future developer find it slow, you should probably look into finding
   * the right indexing strategy rather than rewrite or split up this query. OnlineWeb has relatively little data, and
   * as such this query should be performant enough with good indexing.
   */
  findMany(handle: DBHandle, query: EventFilterQuery, page: Pageable): Promise<Event[]>
  findByAttendingUserId(handle: DBHandle, userId: UserId, page: Pageable): Promise<Event[]>
  addEventHostingGroups(handle: DBHandle, eventId: EventId, hostingGroupIds: Set<GroupId>): Promise<void>
  addEventInterestGroups(handle: DBHandle, eventId: EventId, interestGroupIds: Set<InterestGroupId>): Promise<void>
  addEventCompanies(handle: DBHandle, eventId: EventId, companyIds: Set<CompanyId>): Promise<void>
  deleteEventHostingGroups(handle: DBHandle, eventId: EventId, hostingGroupIds: Set<GroupId>): Promise<void>
  deleteEventInterestGroups(handle: DBHandle, eventId: EventId, interestGroupIds: Set<InterestGroupId>): Promise<void>
  deleteEventCompanies(handle: DBHandle, eventId: EventId, companyIds: Set<CompanyId>): Promise<void>
  addAttendance(handle: DBHandle, eventId: EventId, attendanceId: string): Promise<Event>
}

export function getEventRepository(): EventRepository {
  return {
    async create(handle, data) {
      const row = await handle.event.create({ data })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after creation")
      return event
    },
    async update(handle, id, data) {
      const row = await handle.event.update({ where: { id }, data })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after update")
      return event
    },
    async findMany(handle, query, page) {
      const events = await handle.event.findMany({
        ...pageQuery(page),
        orderBy: { start: "desc" },
        where: {
          AND: [
            {
              status: { not: "DELETED" },
              start: {
                gte: query.byStartDate.min ?? undefined,
                lte: query.byStartDate.max ?? undefined,
              },
              title:
                query.bySearchTerm !== null
                  ? {
                      contains: query.bySearchTerm,
                    }
                  : undefined,
              id: query.byId.length > 0 ? { in: query.byId } : undefined,
            },
            {
              OR: [
                {
                  companies:
                    query.byOrganizingCompany.length > 0
                      ? { some: { companyId: { in: query.byOrganizingCompany } } }
                      : undefined,
                },
                {
                  hostingGroups:
                    query.byOrganizingGroup.length > 0
                      ? { some: { groupId: { in: query.byOrganizingGroup } } }
                      : undefined,
                },
                {
                  interestGroups:
                    query.byOrganizingInterestGroup.length > 0
                      ? { some: { interestGroupId: { in: query.byOrganizingInterestGroup } } }
                      : undefined,
                },
              ],
            },
          ],
        },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
          hostingGroups: {
            include: {
              group: true,
            },
          },
          interestGroups: {
            include: {
              interestGroup: true,
            },
          },
        },
      })
      return events.map((event) => ({
        ...event,
        companies: event.companies.map((c) => c.company),
        hostingGroups: event.hostingGroups.map((g) => g.group),
        interestGroups: event.interestGroups.map((ig) => ig.interestGroup),
      }))
    },
    async findById(handle, id) {
      const event = await handle.event.findUnique({
        where: { id, status: { not: "DELETED" } },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
          hostingGroups: {
            include: {
              group: true,
            },
          },
          interestGroups: {
            include: {
              interestGroup: true,
            },
          },
        },
      })
      if (event === null) {
        return null
      }
      return {
        ...event,
        companies: event?.companies.map((c) => c.company) ?? [],
        hostingGroups: event?.hostingGroups.map((g) => g.group) ?? [],
        interestGroups: event?.interestGroups.map((ig) => ig.interestGroup) ?? [],
      }
    },
    async findByAttendingUserId(handle, userId, page) {
      const events = await handle.attendee.findMany({
        where: {
          userId,
        },
        include: {
          attendance: {
            include: {
              events: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })
      const ids = events.flatMap((attendee) => attendee.attendance.events.map((event) => event.id))
      return this.findMany(
        handle,
        {
          byId: ids,
          byStartDate: { min: null, max: null },
          bySearchTerm: null,
          byOrganizingCompany: [],
          byOrganizingGroup: [],
          byOrganizingInterestGroup: [],
        },
        page
      )
    },
    async addEventHostingGroups(handle, eventId, hostingGroupIds) {
      await handle.eventHostingGroup.createMany({
        data: hostingGroupIds
          .values()
          .map((groupId) => ({
            eventId,
            groupId,
          }))
          .toArray(),
      })
    },
    async addEventInterestGroups(handle, eventId, interestGroupIds) {
      await handle.eventInterestGroup.createMany({
        data: interestGroupIds
          .values()
          .map((interestGroupId) => ({
            eventId,
            interestGroupId,
          }))
          .toArray(),
      })
    },
    async addEventCompanies(handle, eventId, companyIds) {
      await handle.eventCompany.createMany({
        data: companyIds
          .values()
          .map((companyId) => ({
            eventId,
            companyId,
          }))
          .toArray(),
      })
    },
    async deleteEventHostingGroups(handle, eventId, hostingGroupIds) {
      await handle.eventHostingGroup.deleteMany({
        where: {
          eventId,
          groupId: { in: Array.from(hostingGroupIds.values()) },
        },
      })
    },
    async deleteEventInterestGroups(handle, eventId, interestGroupIds) {
      await handle.eventInterestGroup.deleteMany({
        where: {
          eventId,
          interestGroupId: { in: Array.from(interestGroupIds.values()) },
        },
      })
    },
    async deleteEventCompanies(handle, eventId, companyIds) {
      await handle.eventCompany.deleteMany({
        where: {
          eventId,
          companyId: { in: Array.from(companyIds.values()) },
        },
      })
    },
    async addAttendance(handle, eventId, attendanceId) {
      const row = await handle.event.update({ where: { id: eventId }, data: { attendanceId } })
      const event = await this.findById(handle, row.id)
      invariant(event !== null, "Event should exist within same transaction after adding attendance")
      return event
    },
  }
}
