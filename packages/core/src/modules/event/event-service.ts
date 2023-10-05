import { type Attendance, type AttendanceWrite, type Event, type EventWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type AttendanceRepository } from "./attendance-repository";
import { type EventRepository } from "./event-repository";

export interface EventService {
    createEvent(eventCreate: EventWrite): Promise<Event>;
    updateEvent(id: Event["id"], payload: Omit<EventWrite, "id">): Promise<Event>;
    getEventById(id: Event["id"]): Promise<Event>;
    getEvents(take: number, cursor?: Cursor): Promise<Array<Event>>;
    getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Array<Event>>;

    createAttendance(eventId: Event["id"], attendanceWrite: AttendanceWrite): Promise<Attendance>;
    listAttendance(eventId: Event["id"]): Promise<Array<Attendance>>;
    createWaitlist(eventId: Event["id"]): Promise<Attendance>;
}

export class EventServiceImpl implements EventService {
    public constructor(
        private readonly eventRepository: EventRepository,
        private readonly attendanceRepository: AttendanceRepository
    ) {}

    public async createEvent(eventCreate: EventWrite): Promise<Event> {
        const event = await this.eventRepository.create(eventCreate);

        if (!event) {
            throw new Error("Failed to create event");
        }

        return event;
    }

    public async getEvents(take: number, cursor?: Cursor): Promise<Array<Event>> {
        const events = await this.eventRepository.getAll(take, cursor);

        return events;
    }

    public async getEventsByCommitteeId(
        committeeId: string,
        take: number,
        cursor?: { id: string; createdAt: Date } | undefined
    ): Promise<Array<Event>> {
        const events = await this.eventRepository.getAllByCommitteeId(committeeId, take, cursor);

        return events;
    }

    public async getEventById(id: Event["id"]): Promise<Event> {
        const event = await this.eventRepository.getById(id);

        if (!event) {
            throw new NotFoundError(`Event with ID:${id} not found`);
        }

        return event;
    }

    public async updateEvent(id: Event["id"], eventUpdate: Omit<EventWrite, "id">): Promise<Event> {
        const event = await this.eventRepository.update(id, eventUpdate);

        return event;
    }

    public async createAttendance(eventId: Event["id"], attendanceCreate: AttendanceWrite): Promise<Attendance> {
        const attendance = await this.attendanceRepository.create({
            ...attendanceCreate,
            eventId,
        });

        return attendance;
    }

    public async listAttendance(eventId: Event["id"]): Promise<Array<Attendance>> {
        const attendance = await this.attendanceRepository.getByEventId(eventId);

        return attendance;
    }

    public async createWaitlist(eventId: Event["id"]): Promise<Attendance> {
        const event = await this.getEventById(eventId);

        if (event.waitlist !== null) {
            throw new Error(`Attempted to create waitlist for event ${eventId}`);
        }

        const waitlist = await this.attendanceRepository.create({
            eventId,
            start: new Date(),
            end: new Date(),
            deregisterDeadline: new Date(),
            limit: 999999,
            min: 0,
            max: 0,
        });

        await this.eventRepository.update(eventId, {
            ...event,
            waitlist: waitlist.id,
        });

        return waitlist;
    }
}
