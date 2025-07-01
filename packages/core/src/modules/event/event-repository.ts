import type { DBClient, EventInterestGroup } from "@dotkomonline/db"
import type { Event, EventFilter, EventId, EventWrite, InterestGroupId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface EventRepository {
  create(data: EventWrite): Promise<Event>
  update(id: EventId, data: Partial<EventWrite>): Promise<Event>
  getAll(page?: Pageable, filter?: EventFilter): Promise<Event[]>
  getAllByUserAttending(userId: string): Promise<Event[]>
  getAllByHostingGroupId(groupId: string, page: Pageable): Promise<Event[]>
  getAllByInterestGroupId(interestGroupId: string, page: Pageable): Promise<Event[]>
  getById(id: string): Promise<Event | null>
  addAttendance(eventId: EventId, attendanceId: string): Promise<Event>
  addEventToInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<EventInterestGroup>
  removeEventFromInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<void>
}

export class EventRepositoryImpl implements EventRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async addAttendance(id: EventId, attendanceId: string) {
    return await this.db.event.update({ where: { id }, data: { attendanceId } })
  }

  async create(data: EventWrite) {
    return await this.db.event.create({ data })
  }

  async update(id: EventId, data: Partial<EventWrite>) {
    return await this.db.event.update({ where: { id }, data })
  }

  async getAll(page?: Pageable, filter?: EventFilter) {
    return await this.db.event.findMany({
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
  }

  async getAllByUserAttending(userId: string) {
    return await this.db.event.findMany({
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
  }

  async getAllByHostingGroupId(groupId: string, page: Pageable) {
    return await this.db.event.findMany({
      where: {
        status: { not: "DELETED" },
        hostingGroups: {
          some: { groupId },
        },
      },
      ...pageQuery(page),
    })
  }

  async getById(id: string) {
    return await this.db.event.findUnique({ where: { id, status: { not: "DELETED" } } })
  }

  async getAllByInterestGroupId(interestGroupId: string, page: Pageable) {
    return await this.db.event.findMany({
      where: {
        status: { not: "DELETED" },
        interestGroups: {
          some: { interestGroupId },
        },
      },
      ...pageQuery(page),
    })
  }

  async addEventToInterestGroup(eventId: EventId, interestGroupId: InterestGroupId) {
    return await this.db.eventInterestGroup.create({ data: { interestGroupId, eventId } })
  }

  async removeEventFromInterestGroup(eventId: EventId, interestGroupId: InterestGroupId) {
    await this.db.eventInterestGroup.delete({ where: { eventId_interestGroupId: { interestGroupId, eventId } } })
  }
}
