import { Event } from "@dotkomonline/types"
import { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { describe, vi } from "vitest"

import { NotFoundError } from "../../../errors/errors"
import { AttendanceRepositoryImpl } from "../attendee-repository"
import { EventRepositoryImpl } from "../event-repository"
import { EventServiceImpl } from "../event-service"

describe("EventService", () => {
  const db = vi.mocked(Kysely.prototype)
  const eventRepository = new EventRepositoryImpl(db)
  const attendanceRepository = new AttendanceRepositoryImpl(db)
  const eventService = new EventServiceImpl(eventRepository, attendanceRepository)

  const payload: Omit<Event, "id"> = {
    title: "Kotlin og spillutvikling med Bekk",
    subtitle: "Bekk kommer for å holde kurs i kotlin og spillutvikling!",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fhttps://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/lg/59dec779-da56-40f1-be27-4045630c708a.png",
    description: "Kotlin er et relativt nytt programmeringsspråk som de siste årene har blitt veldig populært",
    location: "Verkstedteknisk: VE22",
    public: false,
    start: new Date(),
    end: new Date(),
    createdAt: new Date(2022, 1, 1),
    updatedAt: new Date(2022, 1, 1),
    status: "PUBLIC",
    type: "COMPANY",
    committeeId: null,
  }

  it("creates a new event", async () => {
    const id = randomUUID()
    vi.spyOn(eventRepository, "create").mockResolvedValueOnce({ id, ...payload })
    const event = await eventService.createEvent(payload)
    expect(event).toEqual({ id, ...payload })
    expect(eventRepository.create).toHaveBeenCalledWith(payload)
  })

  it("finds events by id", async () => {
    const id = randomUUID()
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce(undefined)
    const missing = eventService.getEventById(id)
    await expect(missing).rejects.toThrow(NotFoundError)
    vi.spyOn(eventRepository, "getById").mockResolvedValueOnce({ id, ...payload })
    const real = await eventService.getEventById(id)
    expect(real).toEqual({ id, ...payload })
  })
})