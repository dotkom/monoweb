import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, CompanyWrite } from "@dotkomonline/types"
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
      return await handle.company.findUnique({ where: { id } })
    },
    async getBySlug(handle, slug) {
      return await handle.company.findUnique({ where: { slug } })
    },
    async getAll(handle, page) {
      return await handle.company.findMany({ ...pageQuery(page) })
    },
    async create(handle, values) {
      return await handle.company.create({ data: values })
    },
    async update(handle, id, data) {
      return await handle.company.update({ where: { id }, data })
    },
  }
}
