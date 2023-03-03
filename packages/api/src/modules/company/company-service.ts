import { Cursor } from "@/utils/db-utils"
import { Company, CompanyWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { CompanyRepository } from "./company-repository"

export interface CompanyService {
  getCompany(id: Company["id"]): Promise<Company>
  getCompanies(take: number, cursor?: Cursor): Promise<Company[]>
  createCompany(payload: CompanyWrite): Promise<Company>
}

export class CompanyServiceImpl implements CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async getCompany(id: Company["id"]): Promise<Company> {
    const company = await this.companyRepository.getById(id)
    if (!company) throw new NotFoundError(`Company with ID:${id} not found`)
    return company
  }

  async getCompanies(take: number, cursor?: Cursor): Promise<Company[]> {
    const companies = await this.companyRepository.getAll(take, cursor)
    return companies
  }

  async createCompany(payload: CompanyWrite): Promise<Company> {
    const company = await this.companyRepository.create(payload)
    if (!company) throw new Error("Failed to create company")
    return company
  }
}
