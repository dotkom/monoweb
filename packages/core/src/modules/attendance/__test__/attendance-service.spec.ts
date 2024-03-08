import { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { describe, vi } from "vitest"
import { type Company } from "@dotkomonline/types"

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
    image: null,
  }

  it("creates links a company to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "createCompany").mockResolvedValueOnce(undefined)
    const event = await eventCompanyService.createCompany(id, bekk.id)
    expect(event).toEqual(undefined)
    expect(eventCompanyRepository.createCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("gets all companies related to an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "getCompaniesByEventId").mockResolvedValueOnce([bekk])
    const companies = await eventCompanyService.getCompaniesByEventId(id, 20, undefined)
    expect(companies).toEqual([bekk])
    expect(eventCompanyRepository.getCompaniesByEventId).toHaveBeenCalledWith(id, 20, undefined)
  })

  it("deletes companies from an event", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    const companies = await eventCompanyService.deleteCompany(id, bekk.id)
    expect(companies).toEqual(undefined)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
  })

  it("silently deletes missing links", async () => {
    const id = randomUUID()
    vi.spyOn(eventCompanyRepository, "deleteCompany").mockResolvedValueOnce(undefined)
    await eventCompanyService.deleteCompany(id, bekk.id)
    expect(eventCompanyRepository.deleteCompany).toHaveBeenCalledWith(id, bekk.id)
  })
})
