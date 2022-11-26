import { Database } from "@dotkomonline/db"
import { Kysely, Selectable } from "kysely"
import { type User, UserSchema } from "@dotkomonline/types"

export const mapToUser = (payload: Selectable<Database["User"]>): User => {
  return UserSchema.parse(payload)
}

export interface UserRepository {
  getUserByID: (id: string) => Promise<User | undefined>
  getUsers: (limit: number) => Promise<User[]>
  createUser: (email: string, password: string) => Promise<User | undefined>
  getUserByEmail: (email: string) => Promise<User | undefined>
}

export const initUserRepository = (db: Kysely<Database>): UserRepository => {
  const repo: UserRepository = {
    getUserByID: async (id) => {
      const user = await db.selectFrom("User").selectAll().where("id", "=", id).executeTakeFirst()
      return user ? mapToUser(user) : undefined
    },
    getUserByEmail: async (email) => {
      const user = await db.selectFrom("User").selectAll().where("email", "=", email).executeTakeFirst()
      return user ? mapToUser(user) : undefined
    },
    getUsers: async (limit: number) => {
      const users = await db.selectFrom("User").selectAll().limit(limit).execute()
      return users.map(mapToUser)
    },
    createUser: async (email, password) => {
      const user = await db
        .insertInto("User")
        .values({ email: email, password: password })
        .returningAll()
        .executeTakeFirst()
      return user ? mapToUser(user) : undefined
    },
  }
  return repo
}
