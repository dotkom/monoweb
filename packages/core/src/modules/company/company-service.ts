import type { Company, CompanyId, CompanyWrite } from "@dotkomonline/types"
import type { Cursor } from "../../query"
import { CompanyNotFoundError } from "./company-error"
import type { CompanyRepository } from "./company-repository"

export interface CompanyService {
  getCompany(id: CompanyId): Promise<Company>
  getCompanies(take: number, cursor?: Cursor): Promise<Company[]>
  createCompany(payload: CompanyWrite): Promise<Company>
  updateCompany(id: CompanyId, payload: Omit<CompanyWrite, "id">): Promise<Company>
}

export class CompanyServiceImpl implements CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  /**
   * Get a company by its id
   *
   * @throws {CompanyNotFoundError} if the company does not exist
   */
  async getCompany(id: CompanyId): Promise<Company> {
    const company = await this.companyRepository.getById(id)
    if (!company) {
      throw new CompanyNotFoundError(id)
    }
    return company
  }

  async getCompanies(take: number, cursor?: Cursor): Promise<Company[]> {
    const companies = await this.companyRepository.getAll(take, cursor)
    return companies
  }

  async createCompany(payload: CompanyWrite): Promise<Company> {
    const company = await this.companyRepository.create(payload)
    return company
  }

  async updateCompany(id: CompanyId, companyUpdate: Omit<CompanyWrite, "id">): Promise<Company> {
    const company = await this.companyRepository.update(id, companyUpdate)
    return company
  }
}
