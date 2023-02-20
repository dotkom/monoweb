import { Attendance, AttendanceWrite, Event, EventWrite } from "@dotkomonline/types"

import { NotFoundError } from "../../errors/errors"
import { AttendanceRepository } from "./attendee-repository"
import { EventRepository } from "./event-repository"

export interface EventService {
  create: (payload: EventWrite) => Promise<Event>
  getEventById: (id: Event["id"]) => Promise<Event>
  getEvents: () => Promise<Event[]>
  updateEvent: (id: Event["id"], eventUpdate: EventWrite) => Promise<Event>
  addAttendancePool: (eventId: Event["id"], attendanceWrite: AttendanceWrite) => Promise<Attendance>
}

export const initEventService = (
  eventRepository: EventRepository,
  attendanceRepository: AttendanceRepository
): EventService => ({
  create: async (payload) => {
    const event = await eventRepository.create(payload)
    if (!event) throw new Error("Failed to create event")
    return event
  },
  getEvents: async () => {
    const events = await eventRepository.get()
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
  addAttendancePool: async (eventId, attendanceWrite) => {
    const attendance = await attendanceRepository.createAttendance({ ...attendanceWrite, eventId })
    return attendance
  },
})
