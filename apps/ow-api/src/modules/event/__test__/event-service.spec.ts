import { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { describe, vi } from "vitest"

import { NotFoundError } from "../../../errors/errors"
import { initEventRepository } from "../event-repository"
import { initEventService } from "../event-service"

describe("EventService", () => {
  const db = vi.mocked(Kysely.prototype)
  const eventRepository = initEventRepository(db)
  const eventService = initEventService(eventRepository)

  const payload = {
    title: "Kotlin og spillutvikling med Bekk",
    subtitle: "Bekk kommer for å holde kurs i kotlin og spillutvikling!",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fhttps://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/lg/59dec779-da56-40f1-be27-4045630c708a.png",
    description: "Kotlin er et relativt nytt programmeringsspråk som de siste årene har blitt veldig populært",
    location: "Verkstedteknisk: VE22",
    public: false,
    start: new Date(),
    end: new Date(),
    status: "open",
  } as const

  it("creates a new event", async () => {
    const id = randomUUID()
    vi.spyOn(eventRepository, "createEvent").mockResolvedValueOnce({ id, ...payload })
    const event = await eventService.create(payload)
    expect(event).toEqual({ id, ...payload })
    expect(eventRepository.createEvent).toHaveBeenCalledWith(payload)
  })

  it("finds events by id", async () => {
    const id = randomUUID()
    vi.spyOn(eventRepository, "getEventByID").mockResolvedValueOnce(undefined)
    const missing = eventService.getEvent(id)
    await expect(missing).rejects.toThrow(NotFoundError)
    vi.spyOn(eventRepository, "getEventByID").mockResolvedValueOnce({ id, ...payload })
    const real = await eventService.getEvent(id)
    expect(real).toEqual({ id, ...payload })
  })
})
