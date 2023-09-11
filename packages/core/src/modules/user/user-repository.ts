import { Database } from "@dotkomonline/db"
import { Kysely, Selectable } from "kysely"
import { type User, UserId, UserSchema, UserWrite } from "@dotkomonline/types"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => {
  return UserSchema.parse(payload)
}

export interface UserRepository {
  getById(id: UserId): Promise<User | undefined>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserWrite): Promise<User>
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getById(id: UserId) {
    const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst()
    return user ? mapToUser(user) : undefined
  }
  async getAll(limit: number) {
    const users = await this.db.selectFrom("owUser").selectAll().limit(limit).execute()
    return users.map(mapToUser)
  }
  async create(userWrite: UserWrite) {
    const user = await this.db.insertInto("owUser").values(userWrite).returningAll().executeTakeFirstOrThrow()
    return mapToUser(user)
  }
}
