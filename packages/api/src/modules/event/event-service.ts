import { Attendance, AttendanceWrite, Event, EventWrite } from "@dotkomonline/types"

import { NotFoundError } from "../../errors/errors"
import { EventRepository } from "./event-repository"

export interface EventService {
  createEvent: (payload: EventWrite) => Promise<Event>
  getEventById: (id: Event["id"]) => Promise<Event>
  getEvents: (limit: number, offset?: number) => Promise<Event[]>
  updateEvent: (id: Event["id"], eventUpdate: EventWrite) => Promise<Event>
  addAttendancePool: (eventID: Event["id"], attendanceWrite: AttendanceWrite) => Promise<Attendance>
}

export const initEventService = (eventRepository: EventRepository): EventService => ({
  createEvent: async (payload) => {
    const event = await eventRepository.create(payload)
    if (!event) throw new Error("Failed to create event")
    return event
  },
  getEvents: async (limit, offset) => {
    const events = await eventRepository.get(limit, offset)
    return events
  },
  getEventById: async (id) => {
    const event = await eventRepository.getById(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }
    return event
  },
  updateEvent: async (id, eventUpdate) => {
    const event = await eventRepository.update(id, eventUpdate)
    if (!event) {
      throw new NotFoundError(`Could not update Event(${id})`)
    }
    return event
  },
  addAttendancePool: async (eventID, attendanceWrite) => {
    const attendance = await eventRepository.createAttendance(eventID, attendanceWrite)
    return attendance
  },
})
