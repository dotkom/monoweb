import { Database } from "@dotkomonline/db"
import { sql, Kysely, Selectable } from "kysely"
import { Profile, ProfileSchema, ProfileWrite } from "@dotkomonline/types"

const mapToProfile = (data: Selectable<Database["profile"]>) => ProfileSchema.parse(data)

export interface ProfileRepository {
  getPrivacyOptionsById(id: string): Promise<Profile | undefined>
  createProfile(profile: ProfileWrite): Promise<Profile | undefined>
}

export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getPrivacyOptionsById(id: string): Promise<Profile | undefined> {
    const profile = await this.db.selectFrom("profile").selectAll().where("userId", "=", id).executeTakeFirst()
    return profile ? mapToProfile(profile) : undefined
  }
  async createProfile(values: ProfileWrite): Promise<Profile | undefined> {
    const profile = await this.db.insertInto("profile").values(values).returningAll().executeTakeFirst()

    return profile ? mapToProfile(profile) : profile
  }
}
