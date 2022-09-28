import { NotFoundError } from "../../errors/errors"
import { Company, InsertCompany } from "./company"
import { CompanyRepository } from "./company-repository"

export interface CompanyService {
  getCompany: (id: Company["id"]) => Promise<Company>
  getCompanies: (limit: number) => Promise<Company[]>
  register: (payload: InsertCompany) => Promise<Company>
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
  register: async (payload) => {
    const company = await companyRepository.createCompany(payload)
    return company
  },
})
