import { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { describe, vi } from "vitest"
import { EventCompanyRepository, EventCompanyRepositoryImpl } from "../event-company-repository"
import { EventCompanyService, EventCompanyServiceImpl } from "../event-company-service"
import { Company } from "@dotkomonline/types"

describe("EventCompanyService", () => {
  const db = vi.mocked(Kysely.prototype)
  const eventCompanyRepository: EventCompanyRepository = new EventCompanyRepositoryImpl(db)
  const eventCompanyService: EventCompanyService = new EventCompanyServiceImpl(eventCompanyRepository)

  const bekk: Company = {
    createdAt: new Date(),
    description: "Bekk er et konsulentselskap",
    email: "bekk@bekk.no",
    id: randomUUID(),
    name: "Bekk",
    phone: "+47 123 45 678",
    type: "Consulting",
    website: "https://bekk.no",
    location: "Oslo & Trondheim",
  }

  it("creates links a company to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "addCompany").mockResolvedValueOnce([bekk])
    const event = await eventCompanyService.addCompany(id, bekk.id)
    expect(event).toEqual([bekk])
    expect(eventCompanyRepository.addCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("gets all companies related to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "getCompaniesByEventId").mockResolvedValueOnce([bekk])
    const companies = await eventCompanyService.getCompaniesByEventId(id)
    expect(companies).toEqual([bekk])
    expect(eventCompanyRepository.getCompaniesByEventId).toHaveBeenCalledWith(id)
  })

  it("deletes companies from an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce([])
    const companies = await eventCompanyService.deleteCompany(id, bekk.id)
    expect(companies).toEqual([])
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("silently deletes missing links", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    vi.spyOn(eventCompanyRepository, "getCompaniesByEventId").mockResolvedValueOnce([])
    const companies = await eventCompanyService.deleteCompany(id, bekk.id)
    expect(companies).toEqual([])
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
    expect(eventCompanyRepository.getCompaniesByEventId).toHaveBeenCalledWith(id)
  })
})
