import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

import { NotFoundError } from "../../errors/errors"
import { Event } from "./event"
import { EventRepository } from "./event-repository"

type EventTable = Database["event"]

export interface EventService {
  create: (payload: Insertable<EventTable>) => Promise<Event>
  getEvent: (id: Event["id"]) => Promise<Event>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
}

export const initEventService = (eventRepository: EventRepository): EventService => ({
  create: async (payload) => {
    const event = await eventRepository.createEvent(payload)
    if (!event) throw new Error("Failed to create event")
    return event
  },
  getEvents: async (limit, offset) => {
    const events = await eventRepository.getEvents(limit, offset)
    return events
  },
  getEvent: async (id) => {
    const event = await eventRepository.getEventByID(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }
    return event
  },
})
