import { describe, vi } from "vitest"
import { PrismaClient } from "@dotkomonline/db"
import { initEventRepository } from "../event-repository"
import { NotFoundError } from "@/errors/errors"
import { initEventService } from "../event-service"
import { InsertEvent } from "../event"
import { randomUUID } from "crypto"

describe("EventService", () => {
  const prisma = vi.mocked(PrismaClient.prototype)
  const eventRepository = initEventRepository(prisma)
  const eventService = initEventService(eventRepository)

  const payload: InsertEvent = {
    title: "Kotlin og spillutvikling med Bekk",
    subtitle: "Bekk kommer for å holde kurs i kotlin og spillutvikling!",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fhttps://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/lg/59dec779-da56-40f1-be27-4045630c708a.png",
    description: "Kotlin er et relativt nytt programmeringsspråk som de siste årene har blitt veldig populært",
    location: "Verkstedteknisk: VE22",
    organizerId: randomUUID(),
    public: false,
    start: new Date(),
    end: new Date(),
    status: "PRIVATE",
  }

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
