import type { Database } from "@dotkomonline/db"
import { type User, type UserCreate, type UserId, UserSchema, type UserUpdate } from "@dotkomonline/types"
import { type Kysely, type Selectable, sql } from "kysely"
import { type Cursor, orderedQuery, withInsertJsonValue } from "../../utils/db-utils"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload)

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserCreate): Promise<User>
  update(id: UserId, data: Partial<UserUpdate>): Promise<User>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getById(id: UserId) {
    const user = await this.db.selectFrom("owUser").selectAll().where("auth0Id", "=", id).executeTakeFirst()
    return user ? mapToUser(user) : null
  }

  async getAll(limit: number) {
    const users = await this.db.selectFrom("owUser").selectAll().limit(limit).execute()
    return users.map(mapToUser)
  }
  async create(data: UserCreate) {
    const user = await this.db
      .insertInto("owUser")
      .values(withInsertJsonValue(data, "allergies"))
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToUser(user)
  }
  async update(id: UserId, data: UserCreate) {
    const user = await this.db
      .updateTable("owUser")
      .set(withInsertJsonValue(data, "allergies"))
      .where("auth0Id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToUser(user)
  }
  async searchByFullName(searchQuery: string, take: number, cursor?: Cursor) {
    const query = orderedQuery(
      this.db.selectFrom("owUser").selectAll().where(sql`name::text`, "ilike", `%${searchQuery}%`).limit(take),
      cursor
    )
    const users = await query.execute()
    return users.map(mapToUser)
  }
}
