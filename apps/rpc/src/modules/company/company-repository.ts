import type { DBHandle } from "@dotkomonline/db"
import { type Company, type CompanyId, CompanySchema, type CompanyWrite } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface CompanyRepository {
  getById(handle: DBHandle, id: CompanyId): Promise<Company | null>
  getBySlug(handle: DBHandle, slug: string): Promise<Company | null>
  getAll(handle: DBHandle, page: Pageable): Promise<Company[]>
  create(handle: DBHandle, values: CompanyWrite): Promise<Company>
  update(handle: DBHandle, id: CompanyId, data: Partial<CompanyWrite>): Promise<Company>
}

export function getCompanyRepository(): CompanyRepository {
  return {
    async getById(handle, id) {
      const company = await handle.company.findUnique({ where: { id } })
      return company ? parseOrReport(CompanySchema, company) : null
    },
    async getBySlug(handle, slug) {
      const company = await handle.company.findUnique({ where: { slug } })
      return company ? parseOrReport(CompanySchema, company) : null
    },
    async getAll(handle, page) {
      const companies = await handle.company.findMany({ ...pageQuery(page) })
      return companies.map((company) => parseOrReport(CompanySchema, company))
    },
    async create(handle, values) {
      const company = await handle.company.create({ data: values })
      return parseOrReport(CompanySchema, company)
    },
    async update(handle, id, data) {
      const company = await handle.company.update({ where: { id }, data })
      return parseOrReport(CompanySchema, company)
    },
  }
}
