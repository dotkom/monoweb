import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, CompanyWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { CompanyNotFoundError } from "./company-error"
import type { CompanyRepository } from "./company-repository"

export interface CompanyService {
  /**
   * Get a company by its id
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  getCompanyById(handle: DBHandle, id: CompanyId): Promise<Company>
  /**
   * Get a company by its slug
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  getCompanyBySlug(handle: DBHandle, slug: string): Promise<Company>
  getCompanies(handle: DBHandle, page: Pageable): Promise<Company[]>
  createCompany(handle: DBHandle, payload: CompanyWrite): Promise<Company>
  /**
   * Update an existing company
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  updateCompany(handle: DBHandle, id: CompanyId, payload: CompanyWrite): Promise<Company>
}

export function getCompanyService(companyRepository: CompanyRepository): CompanyService {
  return {
    async getCompanyById(handle, id) {
      const company = await companyRepository.getById(handle, id)
      if (!company) {
        throw new CompanyNotFoundError(id)
      }
      return company
    },
    async getCompanyBySlug(handle, slug) {
      const company = await companyRepository.getBySlug(handle, slug)
      if (!company) {
        throw new CompanyNotFoundError(slug)
      }
      return company
    },
    async getCompanies(handle, page) {
      const companies = await companyRepository.getAll(handle, page)
      return companies
    },
    async createCompany(handle, payload) {
      const company = await companyRepository.create(handle, payload)
      return company
    },
    async updateCompany(handle, id, payload): Promise<Company> {
      const company = await companyRepository.update(handle, id, payload)
      return company
    },
  }
}
