import { type Database } from "@dotkomonline/db"
import { UserSchema, type User, type UserId, type UserWrite } from "@dotkomonline/types"
import { sql, type Kysely, type Selectable } from "kysely"
import { orderedQuery, type Cursor } from "../../utils/db-utils"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload)

export interface UserRepository {
  getById(id: UserId): Promise<User | undefined>
  getBySubject(auth0Subject: string): Promise<User | undefined>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getById(id: UserId) {
    const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst()
    return user ? mapToUser(user) : undefined
  }
  async getBySubject(auth0Subject: string) {
    const user = await this.db.selectFrom("owUser").selectAll().where("auth0Sub", "=", auth0Subject).executeTakeFirst()
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
  async update(id: UserId, data: Partial<UserWrite>) {
    const user = await this.db
      .updateTable("owUser")
      .set(data)
      .set({
        updatedAt: new Date(),
      })
      .where("id", "=", id)
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
