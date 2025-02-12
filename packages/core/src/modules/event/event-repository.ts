import type { DBClient } from "@dotkomonline/db"
import type { Event, EventId, EventWrite } from "@dotkomonline/types"

export interface EventRepository {
  create(data: EventWrite): Promise<Event>
  update(id: EventId, data: Partial<EventWrite>): Promise<Event>
  getAll(take: number): Promise<Event[]>
  getAllByUserAttending(userId: string): Promise<Event[]>
  getAllByCommitteeId(committeeId: string, take: number): Promise<Event[]>
  getById(id: string): Promise<Event | null>
  addAttendance(eventId: EventId, attendanceId: string): Promise<Event | null>
}

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly db: DBClient) {}

  async addAttendance(id: EventId, attendanceId: string) {
    return await this.db.event.update({ where: { id }, data: { attendanceId } })
  }

  async create(data: EventWrite): Promise<Event> {
    return await this.db.event.create({ data })
  }

  async update(id: EventId, data: Partial<EventWrite>): Promise<Event> {
    return await this.db.event.update({ where: { id }, data })
  }

  async getAll(take: number): Promise<Event[]> {
    return await this.db.event.findMany({ take })
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

  async getAllByCommitteeId(committeeId: string, take: number): Promise<Event[]> {
    return await this.db.event.findMany({
      where: {
        committees: {
          some: { committeeId },
        },
      },
      take,
    })
  }

  async getById(id: string): Promise<Event | null> {
    return await this.db.event.findUnique({ where: { id } })
  }
}
