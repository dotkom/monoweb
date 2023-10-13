import { type Database } from "@dotkomonline/db"
import { type Kysely, type Selectable } from "kysely"
import { type User, type UserId, UserSchema, type UserWrite } from "@dotkomonline/types"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload)

export interface UserRepository {
  getById: (id: UserId) => Promise<User | undefined>
  getAll: (limit: number) => Promise<User[]>
  create: (userWrite: UserWrite) => Promise<User>
  update: (id: UserId, data: UserWrite) => Promise<User | undefined>
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
  async update(id: UserId, data: UserWrite) {
    const user = await this.db
      .updateTable("owUser")
      .set(data)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToUser(user)
  }
}
