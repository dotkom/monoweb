import { Kysely } from "kysely"

import { Event } from "@dotkomonline/types"
import { initEventRepository } from "../../event/event-repository"
import { initEventService } from "../../event/event-service"
import { randomUUID } from "crypto"

describe("EventService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const eventRepository = initEventRepository(db);
  const eventService = initEventService(eventRepository);

  it("creates a new event", async () => {
    const id = randomUUID();
    const event: Event = {
      id,
      title: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      start: new Date(),
      end: new Date(),
      status: "TBA",
      type: "TBA",
      public: true,
      description: "",
      subtitle: "",
      location: "",
    }

    vi.spyOn(eventRepository, "createEvent").mockResolvedValueOnce(event);
    await expect(eventService.create(event)).resolves.toEqual(event);
    expect(eventRepository.createEvent).toHaveBeenCalledWith(event);
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(eventRepository, "getEventByID").mockResolvedValueOnce(undefined)
    await expect(eventService.getEvent(unknownID)).rejects.toThrow()
    expect(eventRepository.getEventByID).toHaveBeenCalledWith(unknownID)
  });
})
