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
  addAttendance(eventId: EventId, attendanceId: string): Promise<Event | null>
  addEventToInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<EventInterestGroup>
  removeEventFromInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<void>
  delete(id: EventId): Promise<void>
}

export class EventRepositoryImpl implements EventRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async addAttendance(id: EventId, attendanceId: string) {
    return await this.db.event.update({ where: { id }, data: { attendanceId } })
  }

  async create(data: EventWrite): Promise<Event> {
    return await this.db.event.create({ data })
  }

  async update(id: EventId, data: Partial<EventWrite>): Promise<Event> {
    return await this.db.event.update({ where: { id }, data })
  }

  async getAll(page?: Pageable, filter?: EventFilter): Promise<Event[]> {
    return await this.db.event.findMany({
      ...pageQuery(page ?? { take: 100 }),

      where: {
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

  async getAllByUserAttending(userId: string): Promise<Event[]> {
    return await this.db.event.findMany({
      where: {
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

  async getAllByHostingGroupId(groupId: string, page: Pageable): Promise<Event[]> {
    return await this.db.event.findMany({
      where: {
        hostingGroups: {
          some: { groupId },
        },
      },
      ...pageQuery(page),
    })
  }

  async getById(id: string): Promise<Event | null> {
    return await this.db.event.findUnique({ where: { id } })
  }

  async getAllByInterestGroupId(interestGroupId: string, page: Pageable): Promise<Event[]> {
    return await this.db.event.findMany({
      where: {
        interestGroups: {
          some: { interestGroupId },
        },
      },
      ...pageQuery(page),
    })
  }

  async addEventToInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<EventInterestGroup> {
    return await this.db.eventInterestGroup.create({ data: { interestGroupId, eventId } })
  }

  async removeEventFromInterestGroup(eventId: EventId, interestGroupId: InterestGroupId): Promise<void> {
    await this.db.eventInterestGroup.delete({ where: { eventId_interestGroupId: { interestGroupId, eventId } } })
  }

  async delete(id: EventId): Promise<void> {
    await this.db.event.delete({ where: { id } })
  }
}
