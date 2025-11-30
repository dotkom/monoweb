import type { DBHandle } from "@dotkomonline/db"
import { type Company, type CompanyId, CompanySchema, type CompanySlug, type CompanyWrite } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface CompanyRepository {
  findById(handle: DBHandle, companyId: CompanyId): Promise<Company | null>
  findBySlug(handle: DBHandle, companySlug: CompanySlug): Promise<Company | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Company[]>
  create(handle: DBHandle, data: CompanyWrite): Promise<Company>
  update(handle: DBHandle, companyId: CompanyId, data: Partial<CompanyWrite>): Promise<Company>
}

export function getCompanyRepository(): CompanyRepository {
  return {
    async findById(handle, companyId) {
      const company = await handle.company.findUnique({ where: { id: companyId } })
      return parseOrReport(CompanySchema.nullable(), company)
    },

    async findBySlug(handle, companySlug) {
      const company = await handle.company.findUnique({ where: { slug: companySlug } })
      return parseOrReport(CompanySchema.nullable(), company)
    },

    async findMany(handle, page) {
      const companies = await handle.company.findMany({ ...pageQuery(page) })
      return parseOrReport(CompanySchema.array(), companies)
    },

    async create(handle, data) {
      const company = await handle.company.create({ data })
      return parseOrReport(CompanySchema, company)
    },

    async update(handle, companyId, data) {
      const company = await handle.company.update({ where: { id: companyId }, data })
      return parseOrReport(CompanySchema, company)
    },
  }
}
