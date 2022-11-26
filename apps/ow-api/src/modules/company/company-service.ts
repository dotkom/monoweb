import { Company, CompanyWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { CompanyRepository } from "./company-repository"

export interface CompanyService {
  getCompany: (id: Company["id"]) => Promise<Company>
  getCompanies: (limit: number) => Promise<Company[]>
  createCompany: (payload: CompanyWrite) => Promise<Company>
}

export const initCompanyService = (companyRepository: CompanyRepository): CompanyService => ({
  getCompany: async (id) => {
    const company = await companyRepository.getCompanyByID(id)
    if (!company) throw new NotFoundError(`Company with ID:${id} not found`)
    return company
  },
  getCompanies: async (limit) => {
    const companies = await companyRepository.getCompanies(limit)
    return companies
  },
  createCompany: async (payload) => {
    const company = await companyRepository.create(payload)
    if (!company) throw new Error("Failed to create company")
    return company
  },
})
