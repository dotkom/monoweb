import { type Event } from "@dotkomonline/types";
import { randomUUID } from "crypto";
import { Kysely } from "kysely";
import { describe, vi } from "vitest";

import { NotFoundError } from "../../../errors/errors";
import { AttendanceRepositoryImpl } from "../attendance-repository";
import { EventRepositoryImpl } from "../event-repository";
import { EventServiceImpl } from "../event-service";

export const eventPayload: Omit<Event, "id"> = {
  committeeId: null,
  createdAt: new Date(2022, 1, 1),
  description: "Kotlin er et relativt nytt programmeringsspråk som de siste årene har blitt veldig populært",
  end: new Date(),
  imageUrl:
    "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fhttps://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/lg/59dec779-da56-40f1-be27-4045630c708a.png",
  location: "Verkstedteknisk: VE22",
  public: false,
  start: new Date(),
  status: "PUBLIC",
  subtitle: "Bekk kommer for å holde kurs i kotlin og spillutvikling!",
  title: "Kotlin og spillutvikling med Bekk",
  type: "COMPANY",
  updatedAt: new Date(2022, 1, 1),
  waitlist: null,
};

describe("EventService", () => {
  const db = vi.mocked(Kysely.prototype);
  const eventRepository = new EventRepositoryImpl(db);
  const attendanceRepository = new AttendanceRepositoryImpl(db);
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository);

  it("creates a new event", async () => {
    const id = randomUUID();
    vi.spyOn(eventRepository, "create").mockResolvedValueOnce({ id, ...eventPayload });
    const event = await eventService.createEvent(eventPayload);
    expect(event).toEqual({ id, ...eventPayload });
    expect(eventRepository.create).toHaveBeenCalledWith(eventPayload);
  });

  it("finds events by id", async () => {
    const id = randomUUID();
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce(undefined);
    const missing = eventService.getEventById(id);
    await expect(missing).rejects.toThrow(NotFoundError);
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce({ id, ...eventPayload });
    const real = await eventService.getEventById(id);
    expect(real).toEqual({ id, ...eventPayload });
  });
});
