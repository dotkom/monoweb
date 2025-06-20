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
  getCompanyById(id: CompanyId): Promise<Company>
  /**
   * Get a company by its slug
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  getCompanyBySlug(slug: string): Promise<Company>
  getCompanies(page: Pageable): Promise<Company[]>
  createCompany(payload: CompanyWrite): Promise<Company>
  /**
   * Update an existing company
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  updateCompany(id: CompanyId, payload: CompanyWrite): Promise<Company>
}

export class CompanyServiceImpl implements CompanyService {
  private readonly companyRepository: CompanyRepository

  constructor(companyRepository: CompanyRepository) {
    this.companyRepository = companyRepository
  }

  async getCompanyById(id: CompanyId): Promise<Company> {
    const company = await this.companyRepository.getById(id)
    if (!company) {
      throw new CompanyNotFoundError(id)
    }
    return company
  }

  async getCompanyBySlug(slug: string): Promise<Company> {
    const company = await this.companyRepository.getBySlug(slug)
    if (!company) {
      throw new CompanyNotFoundError(slug)
    }
    return company
  }

  async getCompanies(page: Pageable): Promise<Company[]> {
    const companies = await this.companyRepository.getAll(page)
    return companies
  }

  async createCompany(payload: CompanyWrite): Promise<Company> {
    const company = await this.companyRepository.create(payload)
    return company
  }

  async updateCompany(id: CompanyId, companyUpdate: CompanyWrite): Promise<Company> {
    const company = await this.companyRepository.update(id, companyUpdate)
    return company
  }
}
