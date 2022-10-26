import { PrismaClient } from "@dotkomonline/db"

import { Event, InsertEvent, mapToEvent } from "./event"

export interface EventRepository {
  createEvent: (eventInsert: InsertEvent) => Promise<Event>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
  getEventByID: (id: string) => Promise<Event | undefined>
}

export const initEventRepository = (client: PrismaClient): EventRepository => ({
  createEvent: async (eventInsert) => {
    const event = await client.event.create({
      data: {
        ...eventInsert,
      },
    })
    return mapToEvent(event)
  },
  getEvents: async (limit, offset = 0) => {
    const events = await client.event.findMany({ take: limit, skip: offset })
    return events.map(mapToEvent)
  },
  getEventByID: async (id) => {
    const event = await client.event.findUnique({
      where: { id },
    })
    return event ? mapToEvent(event) : undefined
  },
})
