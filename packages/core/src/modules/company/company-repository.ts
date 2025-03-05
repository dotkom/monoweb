import type { DBClient } from "@dotkomonline/db"
import type { Company, CompanyId, CompanyWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface CompanyRepository {
  getById(id: CompanyId): Promise<Company | null>
  getAll(page: Pageable): Promise<Company[]>
  create(values: CompanyWrite): Promise<Company>
  update(id: CompanyId, data: CompanyWrite): Promise<Company>
}

export class CompanyRepositoryImpl implements CompanyRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getById(id: string): Promise<Company | null> {
    return await this.db.company.findUnique({ where: { id } })
  }

  async getAll(page: Pageable): Promise<Company[]> {
    return await this.db.company.findMany({ ...pageQuery(page) })
  }

  async create(data: CompanyWrite): Promise<Company> {
    return await this.db.company.create({ data })
  }

  async update(id: CompanyId, data: Omit<CompanyWrite, "id">): Promise<Company> {
    return await this.db.company.update({ where: { id }, data })
  }
}
