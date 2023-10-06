import { type Database } from "@dotkomonline/db";
import { type PrivacyPermissions, PrivacyPermissionsSchema, type PrivacyPermissionsWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable } from "kysely";

export const mapToPrivacyPermissions = (payload: Selectable<Database["privacyPermissions"]>): PrivacyPermissions =>
  PrivacyPermissionsSchema.parse(payload);

export interface PrivacyPermissionsRepository {
  create(data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>;
  getByUserId(id: string): Promise<PrivacyPermissions | undefined>;
  update(
    userId: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions | undefined>;
}

export class PrivacyPermissionsRepositoryImpl implements PrivacyPermissionsRepository {
  public constructor(private readonly db: Kysely<Database>) {}

  public async create(data: PrivacyPermissionsWrite): Promise<PrivacyPermissions> {
    const privacyPermissions = await this.db
      .insertInto("privacyPermissions")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return mapToPrivacyPermissions(privacyPermissions);
  }

  public async getByUserId(id: string): Promise<PrivacyPermissions | undefined> {
    const privacyPermissions = await this.db
      .selectFrom("privacyPermissions")
      .selectAll()
      .where("userId", "=", id)
      .executeTakeFirst();

    return privacyPermissions ? mapToPrivacyPermissions(privacyPermissions) : undefined;
  }

  public async update(
    userId: string,
    data: Partial<Omit<PrivacyPermissionsWrite, "userId">>
  ): Promise<PrivacyPermissions | undefined> {
    const privacyPermissions = await this.db
      .updateTable("privacyPermissions")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("userId", "=", userId)
      .returningAll()
      .executeTakeFirst();

    return privacyPermissions ? mapToPrivacyPermissions(privacyPermissions) : undefined;
  }
}
