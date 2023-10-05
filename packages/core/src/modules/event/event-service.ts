import { type Attendance, type AttendanceWrite, type Event, type EventWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type AttendanceRepository } from "./attendance-repository";
import { type EventRepository } from "./event-repository";

export interface EventService {
    createAttendance(eventId: Event["id"], attendanceWrite: AttendanceWrite): Promise<Attendance>;
    createEvent(eventCreate: EventWrite): Promise<Event>;
    createWaitlist(eventId: Event["id"]): Promise<Attendance>;
    getEventById(id: Event["id"]): Promise<Event>;
    getEvents(take: number, cursor?: Cursor): Promise<Array<Event>>;

    getEventsByCommitteeId(committeeId: string, take: number, cursor?: Cursor): Promise<Array<Event>>;
    listAttendance(eventId: Event["id"]): Promise<Array<Attendance>>;
    updateEvent(id: Event["id"], payload: Omit<EventWrite, "id">): Promise<Event>;
}

export class EventServiceImpl implements EventService {
    public constructor(
        private readonly eventRepository: EventRepository,
        private readonly attendanceRepository: AttendanceRepository
    ) {}

    public async createAttendance(eventId: Event["id"], attendanceCreate: AttendanceWrite): Promise<Attendance> {
        const attendance = await this.attendanceRepository.create({
            ...attendanceCreate,
            eventId,
        });

        return attendance;
    }

    public async createEvent(eventCreate: EventWrite): Promise<Event> {
        const event = await this.eventRepository.create(eventCreate);

        if (!event) {
            throw new Error("Failed to create event");
        }

        return event;
    }

    public async createWaitlist(eventId: Event["id"]): Promise<Attendance> {
        const event = await this.getEventById(eventId);

        if (event.waitlist !== null) {
            throw new Error(`Attempted to create waitlist for event ${eventId}`);
        }

        const waitlist = await this.attendanceRepository.create({
            deregisterDeadline: new Date(),
            end: new Date(),
            eventId,
            limit: 999999,
            max: 0,
            min: 0,
            start: new Date(),
        });

        await this.eventRepository.update(eventId, {
            ...event,
            waitlist: waitlist.id,
        });

        return waitlist;
    }

    public async getEventById(id: Event["id"]): Promise<Event> {
        const event = await this.eventRepository.getById(id);

        if (!event) {
            throw new NotFoundError(`Event with ID:${id} not found`);
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
        cursor?: { createdAt: Date; id: string } | undefined
    ): Promise<Array<Event>> {
        const events = await this.eventRepository.getAllByCommitteeId(committeeId, take, cursor);

        return events;
    }

    public async listAttendance(eventId: Event["id"]): Promise<Array<Attendance>> {
        const attendance = await this.attendanceRepository.getByEventId(eventId);

        return attendance;
    }

    public async updateEvent(id: Event["id"], eventUpdate: Omit<EventWrite, "id">): Promise<Event> {
        const event = await this.eventRepository.update(id, eventUpdate);

        return event;
    }
}
