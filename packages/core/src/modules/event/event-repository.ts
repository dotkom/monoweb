import type { DBClient } from "@dotkomonline/db"
import type { Event, EventId, EventWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface EventRepository {
  create(data: EventWrite): Promise<Event>
  update(id: EventId, data: Partial<EventWrite>): Promise<Event>
  getAll(page: Pageable): Promise<Event[]>
  getAllByUserAttending(userId: string): Promise<Event[]>
  getAllByHostingGroupId(groupId: string, page: Pageable): Promise<Event[]>
  getById(id: string): Promise<Event | null>
  addAttendance(eventId: EventId, attendanceId: string): Promise<Event | null>
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

  async getAll(page: Pageable): Promise<Event[]> {
    return await this.db.event.findMany({ ...pageQuery(page) })
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
}
