import { type Database } from "@dotkomonline/db"
import { type Company, type CompanyId, CompanySchema, type CompanyWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToCompany = (payload: Selectable<Database["company"]>): Company => CompanySchema.parse(payload)

export interface CompanyRepository {
  getById(id: CompanyId): Promise<Company | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Company[]>
  create(values: CompanyWrite): Promise<Company>
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

  async create(data: CompanyWrite): Promise<Company> {
    const company = await this.db.insertInto("company").values(data).returningAll().executeTakeFirstOrThrow()
    return mapToCompany(company)
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
