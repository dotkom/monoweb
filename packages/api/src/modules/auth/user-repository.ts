import { Database } from "@dotkomonline/db"
import { Kysely, Selectable } from "kysely"
import { type User, UserSchema, UserWrite } from "@dotkomonline/types"

export const mapToUser = (payload: Selectable<Database["owUser"]>): User => {
  return UserSchema.parse(payload)
}

export interface UserRepository {
  getUserByID: (id: string) => Promise<User | undefined>
  getUsers: (limit: number) => Promise<User[]>
  createUser: (userWrite: UserWrite, password: string) => Promise<User | undefined>
  getHashedPassword: (email: string) => Promise<string | undefined>
  getUserByEmail: (email: string) => Promise<User | undefined>
}

// TODO: Delete these/ use webhooks instead from clerk
export const initUserRepository = (db: Kysely<Database>): UserRepository => {
  const repo: UserRepository = {
    getUserByID: async (id) => {
      const user = await db.selectFrom("owUser").selectAll().where("id", "=", id).executeTakeFirst()
      return user ? mapToUser(user) : undefined
    },
    getHashedPassword: async (email) => {
      const res = await db.selectFrom("owUser").select("password").where("email", "=", email).executeTakeFirst()
      return res?.password
    },
    getUserByEmail: async (email) => {
      const user = await db.selectFrom("owUser").selectAll().where("email", "=", email).executeTakeFirst()
      return user ? mapToUser(user) : undefined
    },
    getUsers: async (limit: number) => {
      const users = await db.selectFrom("owUser").selectAll().limit(limit).execute()
      return users.map(mapToUser)
    },
    createUser: async (userInsert, password) => {
      const user = await db
        .insertInto("owUser")
        .values({ ...userInsert, password })
        .returningAll()
        .executeTakeFirstOrThrow()
      return user ? mapToUser(user) : undefined
    },
  }
  return repo
}
