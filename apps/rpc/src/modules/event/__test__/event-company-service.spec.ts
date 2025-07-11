import { randomUUID } from "node:crypto"
import type { Company } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { describe, vi } from "vitest"
import { getEventCompanyRepository } from "../event-company-repository"
import { getEventCompanyService } from "../event-company-service"

describe("EventCompanyService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const eventCompanyRepository = getEventCompanyRepository()
  const eventCompanyService = getEventCompanyService(eventCompanyRepository)

  const bekk: Company = {
    createdAt: new Date(),
    description: "Bekk er et konsulentselskap",
    email: "bekk@bekk.no",
    id: randomUUID(),
    name: "Bekk",
    slug: "bekk",
    phone: "+47 123 45 678",
    type: "CONSULTING",
    website: "https://bekk.no",
    location: "Oslo & Trondheim",
    image: null,
  }

  it("creates links a company to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "createCompany").mockResolvedValueOnce(undefined)
    const event = await eventCompanyService.createCompany(db, id, bekk.id)
    expect(event).toEqual(undefined)
    expect(eventCompanyRepository.createCompany).toHaveBeenCalledWith(db, id, bekk.id)
  })

  it("gets all companies related to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "getCompaniesByEventId").mockResolvedValueOnce([bekk])
    const companies = await eventCompanyService.getCompaniesByEventId(db, id)
    expect(companies).toEqual([bekk])
    expect(eventCompanyRepository.getCompaniesByEventId).toHaveBeenCalledWith(db, id)
  })

  it("deletes companies from an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    const companies = await eventCompanyService.deleteCompany(db, id, bekk.id)
    expect(companies).toEqual(undefined)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(db, id, bekk.id)
  })

  it("silently deletes missing links", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    await eventCompanyService.deleteCompany(db, id, bekk.id)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(db, id, bekk.id)
  })
})
