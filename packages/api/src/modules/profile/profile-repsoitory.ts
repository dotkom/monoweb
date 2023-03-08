import { Database } from "@dotkomonline/db"
import { sql, Kysely, Selectable } from "kysely"
import { ProfileSchema } from "@dotkomonline/types"

const mapToProfile = (data: Selectable<Database["profile"]>) => ProfileSchema.parse(data)

export interface ProfileRepository {
  getPrivacyOptionsById(id: string): Promise<undefined>
}

export const initProfileRepository = (db: Kysely<Database>): ProfileRepository => {
  const repo: ProfileRepository = {
    async getPrivacyOptionsById(id: string): Promise<undefined> {
      const data = await db.selectFrom("profile").selectAll
      console.log(id)
      return data
    },
  }
  return repo
}
