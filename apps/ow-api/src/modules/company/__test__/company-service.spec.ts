import { Company } from "@dotkomonline/types"
import { randomUUID } from "crypto"
import { Kysely } from "kysely"

import { NotFoundError } from "../../../errors/errors"
import { initCompanyRepository } from "../company-repository"
import { initCompanyService } from "../company-service"

describe("CompanyService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const companyRepository = initCompanyRepository(db)
  const companyService = initCompanyService(companyRepository)

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
    }
    const id = randomUUID()
    vi.spyOn(companyRepository, "create").mockResolvedValueOnce({ id, ...company })
    await expect(companyService.createCompany(company)).resolves.toEqual({ id, ...company })
    expect(companyRepository.create).toHaveBeenCalledWith(company)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(companyRepository, "getCompanyByID").mockResolvedValueOnce(undefined)
    await expect(companyService.getCompany(unknownID)).rejects.toThrow(NotFoundError)
    expect(companyRepository.getCompanyByID).toHaveBeenCalledWith(unknownID)
  })
})
