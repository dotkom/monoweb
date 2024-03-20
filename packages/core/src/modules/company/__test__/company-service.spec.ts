import { randomUUID } from "crypto"
import { type Company } from "@dotkomonline/types"
import { Kysely } from "kysely"
import { CompanyRepositoryImpl } from "../company-repository"
import { CompanyServiceImpl } from "../company-service"
import { CompanyNotFoundError } from "../company-error"

describe("CompanyService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const companyRepository = new CompanyRepositoryImpl(db)
  const companyService = new CompanyServiceImpl(companyRepository)

  it("creates a new company", async () => {
    const company: Omit<Company, "id"> = {
      name: "Duckmouse",
      description: "We sell computer-mouses with ducks inside of them",
      email: "coolguys@company.com",
      phone: "+47 123 45 678",
      website: "www.duckmouse.no",
      location: "Mars",
      type: "Other",
      createdAt: new Date(),
      image: null,
    }
    const id = randomUUID()
    vi.spyOn(companyRepository, "create").mockResolvedValueOnce({ id, ...company })
    await expect(companyService.createCompany(company)).resolves.toEqual({ id, ...company })
    expect(companyRepository.create).toHaveBeenCalledWith(company)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(companyRepository, "getById").mockResolvedValueOnce(undefined)
    await expect(companyService.getCompany(unknownID)).rejects.toThrow(CompanyNotFoundError)
    expect(companyRepository.getById).toHaveBeenCalledWith(unknownID)
  })
})
