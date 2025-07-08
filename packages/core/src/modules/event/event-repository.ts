import type { DBHandle } from "@dotkomonline/db"
import type { EventInterestGroup } from "@dotkomonline/db"
import type { Event, EventFilter, EventId, EventWrite, InterestGroupId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface EventRepository {
  create(handle: DBHandle, data: EventWrite): Promise<Event>
  update(handle: DBHandle, id: EventId, data: Partial<EventWrite>): Promise<Event>
  getAll(handle: DBHandle, page?: Pageable, filter?: EventFilter): Promise<Event[]>
  getAllByUserAttending(handle: DBHandle, userId: string): Promise<Event[]>
  getAllByHostingGroupId(handle: DBHandle, groupId: string, page: Pageable): Promise<Event[]>
  getAllByInterestGroupId(handle: DBHandle, interestGroupId: string, page: Pageable): Promise<Event[]>
  getById(handle: DBHandle, id: string): Promise<Event | null>
  addAttendance(handle: DBHandle, eventId: EventId, attendanceId: string): Promise<Event>
  addEventToInterestGroup(
    handle: DBHandle,
    eventId: EventId,
    interestGroupId: InterestGroupId
  ): Promise<EventInterestGroup>
  removeEventFromInterestGroup(handle: DBHandle, eventId: EventId, interestGroupId: InterestGroupId): Promise<void>
}

export function getEventRepository() {
  return {
    async create(handle: DBHandle, data: EventWrite) {
      return await handle.event.create({ data })
    },
    async update(handle: DBHandle, id: EventId, data: Partial<EventWrite>) {
      return await handle.event.update({ where: { id }, data })
    },
    async getAll(handle: DBHandle, page?: Pageable, filter?: EventFilter) {
      return await handle.event.findMany({
        ...pageQuery(page ?? { take: 100 }),
        orderBy: { start: "desc" },

        where: {
          status: { not: "DELETED" },
          OR: filter?.query
            ? [
                {
                  title: {
                    contains: filter.query,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: filter.query,
                    mode: "insensitive",
                  },
                },
              ]
            : undefined,

          start: filter?.after
            ? {
                gte: filter.after,
              }
            : undefined,

          end: filter?.before
            ? {
                lte: filter.before,
              }
            : undefined,
        },
      })
    },
    async getAllByUserAttending(handle: DBHandle, userId: string) {
      return await handle.event.findMany({
        where: {
          status: { not: "DELETED" },

          attendance: {
            pools: {
              some: {
                attendees: {
                  some: {
                    userId,
                  },
                },
              },
            },
          },
        },
      })
    },
    async getAllByHostingGroupId(handle: DBHandle, groupId: string, page: Pageable) {
      return await handle.event.findMany({
        where: {
          status: { not: "DELETED" },
          hostingGroups: {
            some: { groupId },
          },
        },
        ...pageQuery(page),
      })
    },
    async getAllByInterestGroupId(handle: DBHandle, interestGroupId: string, page: Pageable) {
      return await handle.event.findMany({
        where: {
          status: { not: "DELETED" },
          interestGroups: {
            some: { interestGroupId },
          },
        },
        ...pageQuery(page),
      })
    },
    async getById(handle: DBHandle, id: string) {
      return await handle.event.findUnique({ where: { id, status: { not: "DELETED" } } })
    },
    async addAttendance(handle: DBHandle, eventId: EventId, attendanceId: string) {
      return await handle.event.update({ where: { id: eventId }, data: { attendanceId } })
    },
    async addEventToInterestGroup(handle: DBHandle, eventId: EventId, interestGroupId: InterestGroupId) {
      return await handle.eventInterestGroup.create({ data: { interestGroupId, eventId } })
    },
    async removeEventFromInterestGroup(handle: DBHandle, eventId: EventId, interestGroupId: InterestGroupId) {
      await handle.eventInterestGroup.delete({ where: { eventId_interestGroupId: { interestGroupId, eventId } } })
    },
  }
}
