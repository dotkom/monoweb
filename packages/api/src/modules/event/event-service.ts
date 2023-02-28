import { Attendance, AttendanceWrite, Event, EventWrite } from "@dotkomonline/types"

import { NotFoundError } from "../../errors/errors"
import { AttendanceRepository } from "./attendee-repository"
import { EventRepository } from "./event-repository"

export interface EventService {
  create: (eventCreate: EventWrite) => Promise<Event>
  getById: (id: Event["id"]) => Promise<Event>
  list: () => Promise<Event[]>
  addAttendance: (eventId: Event["id"], attendanceWrite: AttendanceWrite) => Promise<Attendance>
  listAttendance: (eventId: Event["id"]) => Promise<Attendance[]>
  editEvent: (id: Event["id"], payload: Omit<EventWrite, "id">) => Promise<Event>
}

export const initEventService = (
  eventRepository: EventRepository,
  attendanceRepository: AttendanceRepository
): EventService => ({
  create: async (eventCreate) => {
    const event = await eventRepository.create(eventCreate)
    if (!event) {
      throw new Error("Failed to create event")
    }
    return event
  },
  list: async () => {
    const events = await eventRepository.get()
    return events
  },
  getById: async (id) => {
    const event = await eventRepository.getById(id)
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`)
    }
    return event
  },
  editEvent: async (id, eventUpdate) => {
    const event = await eventRepository.update(id, eventUpdate)
    if (!event) {
      throw new NotFoundError(`Could not update Event(${id})`)
    }
    return event
  },
  addAttendance: async (eventId, attendanceCreate) => {
    const attendance = await attendanceRepository.createAttendance({ ...attendanceCreate, eventId })
    return attendance
  },
  listAttendance: async (eventId) => {
    const attendance = await attendanceRepository.getAttendancesByEventId(eventId)
    return attendance
  },
})
