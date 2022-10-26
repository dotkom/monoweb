import { Event, InsertEvent } from "./event"
import { EventRepository } from "@/modules/event/event-repository"
import { NotFoundError } from "@/errors/errors"

export interface EventService {
  create: (payload: InsertEvent) => Promise<Event>
  getEvent: (id: Event["id"]) => Promise<Event>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
}

export const initEventService = (eventRepository: EventRepository): EventService => ({
  create: async (payload) => {
    const event = await eventRepository.createEvent(payload)
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
