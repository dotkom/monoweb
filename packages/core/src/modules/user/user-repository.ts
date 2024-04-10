import type { Database } from "@dotkomonline/db"
import { type UserId, UserSchema, type UserWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable, sql } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload)

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getBySubject(auth0Subject: string): Promise<User | undefined>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getById(id: UserId) {
    console.log(this.db)
    const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst()
    return user ? mapToUser(user) : null
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
    const ins = {
      ...userWrite,
      allergies: userWrite.allergies ? JSON.stringify(userWrite.allergies) : null,
    }

    const user = await this.db.insertInto("owUser").values(ins).returningAll().executeTakeFirstOrThrow()
    return mapToUser(user)
  }
  async update(id: UserId, data: Partial<UserWrite>) {
    const ins = {
      ...data,
      allergies: data.allergies ? JSON.stringify(data.allergies) : null,
    }
    const user = await this.db
      .updateTable("owUser")
      .set(ins)
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
