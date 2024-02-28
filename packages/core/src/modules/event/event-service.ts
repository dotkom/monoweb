import { type Event, type EventId, type EventWrite } from "@dotkomonline/types";
import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type EventInsert } from "./event-repository";
import { type EventRepository } from "./event-repository.js";

export interface EventService {
  createEvent(eventCreate: EventWrite): Promise<Event>;
  updateEvent(id: EventId, payload: Omit<EventWrite, "id">): Promise<Event>;
  getEventById(id: EventId): Promise<Event>;
  getEvents(take: number, cursor?: Cursor): Promise<Event[]>;
  getEventsByCommitteeId(
    committeeId: string,
    take: number,
    cursor?: Cursor
  ): Promise<Event[]>;
}

export class EventServiceImpl implements EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(eventCreate: EventWrite): Promise<Event> {
    const toInsert: EventInsert = {
      ...eventCreate,
      extras: JSON.stringify(eventCreate.extras),
    };

    const event = await this.eventRepository.create(toInsert);
    return event;
  }

  async getEvents(take: number, cursor?: Cursor): Promise<Event[]> {
    const events = await this.eventRepository.getAll(take, cursor);
    return events;
  }

  async getEventsByCommitteeId(
    committeeId: string,
    take: number,
    cursor?: Cursor
  ): Promise<Event[]> {
    const events = await this.eventRepository.getAllByCommitteeId(
      committeeId,
      take,
      cursor
    );
    return events;
  }

  async getEventById(id: EventId): Promise<Event> {
    const event = await this.eventRepository.getById(id);
    if (!event) {
      throw new NotFoundError(`Event with ID:${id} not found`);
    }
    return event;
  }

  async updateEvent(
    id: EventId,
    eventUpdate: Omit<EventWrite, "id">
  ): Promise<Event> {
    const toInsert: EventInsert = {
      ...eventUpdate,
      extras: JSON.stringify(eventUpdate.extras),
    };
    const event = await this.eventRepository.update(id, toInsert);
    return event;
  }
}
