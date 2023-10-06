import { type Database } from "@dotkomonline/db";
import { type Company, CompanySchema, type CompanyWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

import { type Cursor, paginateQuery } from "../../utils/db-utils";

export const mapToCompany = (payload: Selectable<Database["company"]>): Company => CompanySchema.parse(payload);

export interface CompanyRepository {
  create(values: CompanyWrite): Promise<Company | undefined>;
  getAll(take: number, cursor?: Cursor): Promise<Array<Company>>;
  getById(id: Company["id"]): Promise<Company | undefined>;
}

export class CompanyRepositoryImpl implements CompanyRepository {
  public constructor(private readonly db: Kysely<Database>) {}

  public async create(values: CompanyWrite): Promise<Company | undefined> {
    const company = await this.db
      .insertInto("company")
      .values({
        description: values.description,
        email: values.email,
        name: values.name,
        website: values.website,
      })
      .returningAll()
      .executeTakeFirst();

    return company ? mapToCompany(company) : company;
  }

  public async getAll(take: number, cursor?: Cursor): Promise<Array<Company>> {
    let query = this.db.selectFrom("company").selectAll().limit(take);

    if (cursor) {
      query = paginateQuery(query, cursor);
    }

    const companies = await query.execute();

    return companies.map(mapToCompany);
  }

  public async getById(id: string): Promise<Company | undefined> {
    const company = await this.db.selectFrom("company").selectAll().where("id", "=", id).executeTakeFirst();

    return company ? mapToCompany(company) : undefined;
  }
}
