import { PrismaClient } from "@dotkomonline/db"

import { InsertUser, mapToUser, User } from "./user"

export interface UserRepository {
  getUserByID: (id: string) => Promise<User | undefined>
  getUsers: (limit: number) => Promise<User[]>
  createUser: (userInsert: InsertUser) => Promise<User>
}

export const initUserRepository = (client: PrismaClient): UserRepository => {
  const repo: UserRepository = {
    getUserByID: async (id) => {
      const user = await client.user.findUnique({
        where: { id },
      })
      return user ? mapToUser(user) : undefined
    },
    getUsers: async (limit: number) => {
      const users = await client.user.findMany({ take: limit })
      return users.map(mapToUser)
    },
    createUser: async (userInsert) => {
      const { username, email, firstName, lastName } = userInsert
      const user = await client.user.create({
        data: {
          username,
          email,
          first_name: firstName,
          last_name: lastName,
          password: "monkey",
        },
      })
      return mapToUser(user)
    },
  }
  return repo
}
