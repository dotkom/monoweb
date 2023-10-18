import { Database } from "@dotkomonline/db"
import { Company, CompanyId, CompanySchema, CompanyWrite } from "@dotkomonline/types"
import { Kysely, Selectable } from "kysely"
import { Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToCompany = (payload: Selectable<Database["company"]>): Company => {
  return CompanySchema.parse(payload)
}

export interface CompanyRepository {
  getById(id: CompanyId): Promise<Company | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Company[]>
  create(values: CompanyWrite): Promise<Company | undefined>
  update(id: CompanyId, data: CompanyWrite): Promise<Company>
}

export class CompanyRepositoryImpl implements CompanyRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: string): Promise<Company | undefined> {
    const company = await this.db.selectFrom("company").selectAll().where("id", "=", id).executeTakeFirst()
    return company ? mapToCompany(company) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Company[]> {
    const query = orderedQuery(this.db.selectFrom("company").selectAll().limit(take), cursor)
    const companies = await query.execute()
    return companies.map(mapToCompany)
  }

  async create(data: CompanyWrite): Promise<Company | undefined> {
    const company = await this.db.insertInto("company").values(data).returningAll().executeTakeFirst()
    return company ? mapToCompany(company) : company
  }

  async update(id: CompanyId, data: Omit<CompanyWrite, "id">): Promise<Company> {
    const company = await this.db
      .updateTable("company")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToCompany(company)
  }
}
