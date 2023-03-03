import { Cursor, paginateQuery } from "@/utils/db-utils"
import { Database } from "@dotkomonline/db"
import { Company, CompanySchema, CompanyWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"

export const mapToCompany = (payload: Selectable<Database["company"]>): Company => {
  return CompanySchema.parse(payload)
}

export interface CompanyRepository {
  getById(id: Company["id"]): Promise<Company | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Company[]>
  create(values: CompanyWrite): Promise<Company | undefined>
}

export class CompanyRepositoryImpl implements CompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: string): Promise<Company | undefined> {
    const company = await this.db.selectFrom("company").selectAll().where("id", "=", id).executeTakeFirst()
    return company ? mapToCompany(company) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Company[]> {
    let query = this.db.selectFrom("company").selectAll().limit(take)
    if (cursor) {
      query = paginateQuery(query, cursor)
    }
    const companies = await query.execute()
    return companies.map(mapToCompany)
  }

  async create(values: CompanyWrite): Promise<Company | undefined> {
    const company = await this.db
      .insertInto("company")
      .values({
        name: values.name,
        description: values.description,
        email: values.email,
        website: values.website,
      })
      .returningAll()
      .executeTakeFirst()
    return company ? mapToCompany(company) : company
  }
}
