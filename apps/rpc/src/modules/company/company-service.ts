import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, CompanyWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { CompanyRepository } from "./company-repository"

export interface CompanyService {
  /**
   * Get a company by its id
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getCompanyById(handle: DBHandle, id: CompanyId): Promise<Company>
  /**
   * Get a company by its slug
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getCompanyBySlug(handle: DBHandle, slug: string): Promise<Company>
  getCompanies(handle: DBHandle, page: Pageable): Promise<Company[]>
  createCompany(handle: DBHandle, payload: CompanyWrite): Promise<Company>
  /**
   * Update an existing company
   *
   * @throws {NotFoundError} if the company does not exist
   */
  updateCompany(handle: DBHandle, id: CompanyId, payload: CompanyWrite): Promise<Company>
}

export function getCompanyService(companyRepository: CompanyRepository): CompanyService {
  return {
    async getCompanyById(handle, id) {
      const company = await companyRepository.getById(handle, id)
      if (!company) {
        throw new NotFoundError(`Company(ID=${id}) not found`)
      }
      return company
    },
    async getCompanyBySlug(handle, slug) {
      const company = await companyRepository.getBySlug(handle, slug)
      if (!company) {
        throw new NotFoundError(`Company(Slug=${slug}) not found`)
      }
      return company
    },
    async getCompanies(handle, page) {
      return await companyRepository.getAll(handle, page)
    },
    async createCompany(handle, payload) {
      return await companyRepository.create(handle, payload)
    },
    async updateCompany(handle, id, payload): Promise<Company> {
      return await companyRepository.update(handle, id, payload)
    },
  }
}
