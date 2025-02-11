import type { DBClient } from "@dotkomonline/db"
import { type Company, type CompanyId, CompanySchema, type CompanyWrite } from "@dotkomonline/types"

export interface CompanyRepository {
  getById(id: CompanyId): Promise<Company | null>
  getAll(take: number): Promise<Company[]>
  create(values: CompanyWrite): Promise<Company>
  update(id: CompanyId, data: CompanyWrite): Promise<Company>
}

export class CompanyRepositoryImpl implements CompanyRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: string): Promise<Company | null> {
    return await this.db.company.findUnique({ where: { id }})
  }

  async getAll(take: number): Promise<Company[]> {
    return await this.db.company.findMany({ take })
  }

  async create(data: CompanyWrite): Promise<Company> {
    return await this.db.company.create({ data })
  }

  async update(id: CompanyId, data: Omit<CompanyWrite, "id">): Promise<Company> {
    return await this.db.company.update({ where: { id }, data })
  }
}
