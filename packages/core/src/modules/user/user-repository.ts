import { Database } from "@dotkomonline/db"
import { Kysely, Selectable, sql } from "kysely"
import { type User, UserId, UserSchema, UserWrite } from "@dotkomonline/types"
import { Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => {
  return UserSchema.parse(payload)
}

export interface UserRepository {
  getById(id: UserId): Promise<User | undefined>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: UserWrite): Promise<User | undefined>
  search(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
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
    return user ? mapToUser(user) : undefined
  }
  async search(searchQuery: string, take: number, cursor?: Cursor) {
    const query = orderedQuery(
      this.db
        .selectFrom("owUser")
        .selectAll()
        .where(sql`id::text`, "ilike", `%${searchQuery}%`)
        .limit(take),
      cursor
    )
    const users = await query.execute()
    return users.map(mapToUser)
  }
}
