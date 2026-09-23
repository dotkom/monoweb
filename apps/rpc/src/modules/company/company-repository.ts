import type { DBHandle } from "@dotkomonline/db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { parseOrReport } from "../../invariant"
import {
  type Company,
  COMPANY_FILTER_SORT_DEFAULT,
  type CompanyFilterQuery,
  type CompanyId,
  CompanySchema,
  type CompanySlug,
  type CompanyWrite,
} from "./company"

export interface CompanyRepository {
  findById(handle: DBHandle, companyId: CompanyId): Promise<Company | null>
  findBySlug(handle: DBHandle, companySlug: CompanySlug): Promise<Company | null>
  findMany(handle: DBHandle, filter: CompanyFilterQuery, page: Pageable): Promise<Company[]>
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

    async findMany(handle, filter, page) {
      const sortBy = filter.sortBy ?? COMPANY_FILTER_SORT_DEFAULT
      const sortOrder = filter.orderBy ?? "asc"

      const companies = await handle.company.findMany({
        ...pageQuery(page),
        orderBy: { [sortBy]: sortOrder },
        where: {
          name:
            filter.bySearchTerm !== null
              ? {
                  contains: filter.bySearchTerm,
                  mode: "insensitive",
                }
              : undefined,
        },
      })
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
