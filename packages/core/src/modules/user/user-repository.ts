import type { Database } from "@dotkomonline/db"
import { type User, type UserId, UserSchema, type UserWrite } from "@dotkomonline/types"
import { type Kysely, type Selectable, sql } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => UserSchema.parse(payload)

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number): Promise<User[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchByFullName(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: Kysely<Database>) {}
  async getById(id: UserId) {
    const user = await this.db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst()
    return user ? mapToUser(user) : null
  }

  async getAll(limit: number) {
    const users = await this.db.selectFrom("owUser").selectAll().limit(limit).execute()
    return users.map(mapToUser)
  }
  async create(userWrite: UserWrite) {
    const ins = {
      ...userWrite,
      allergies: JSON.stringify(userWrite.allergies),
    }

    const user = await this.db
      .insertInto("owUser")
      .values({
        id: ins.id,
        studyYear: ins.studyYear,
        name: ins.name,
        allergies: ins.allergies,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: ins.email,
        familyName: ins.familyName,
        givenName: ins.givenName,
        lastSyncedAt: new Date(),
        profilePicture: ins.profilePicture,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToUser(user)
  }
  async update(id: UserId, data: Partial<UserWrite>) {
    const ins = {
      ...data,
      allergies: JSON.stringify(data.allergies),
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
