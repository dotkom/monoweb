import { randomUUID } from "node:crypto"
import type { Company } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { CompanyNotFoundError } from "../company-error"
import { getCompanyRepository } from "../company-repository"
import { getCompanyService } from "../company-service"

describe("CompanyService", () => {
  const db = vi.mocked(PrismaClient.prototype, true)
  const companyRepository = getCompanyRepository()
  const companyService = getCompanyService(companyRepository)

  it("creates a new company", async () => {
    const company: Omit<Company, "id"> = {
      name: "Duckmouse",
      slug: "duckmouse",
      description: "We sell computer-mouses with ducks inside of them",
      email: "coolguys@company.com",
      phone: "+47 123 45 678",
      website: "www.duckmouse.no",
      location: "Mars",
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrl: null,
    }
    const id = randomUUID()
    vi.spyOn(companyRepository, "create").mockResolvedValueOnce({ id, ...company })
    await expect(companyService.createCompany(db, company)).resolves.toEqual({ id, ...company })
    expect(companyRepository.create).toHaveBeenCalledWith(db, company)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(companyRepository, "getById").mockResolvedValueOnce(null)
    await expect(companyService.getCompanyById(db, unknownID)).rejects.toThrow(CompanyNotFoundError)
    expect(companyRepository.getById).toHaveBeenCalledWith(db, unknownID)
  })
})
