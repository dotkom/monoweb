import { PrismaClient } from "@dotkomonline/db"

import { InsertUser, mapToUser, User } from "./user"

export interface UserRepository {
  getUserByID: (id: string) => Promise<User | undefined>
  getUsers: (limit: number) => Promise<User[]>
  createUser: (email: string, password: string) => Promise<User>
  getUserByEmail: (email: string) => Promise<User | undefined>
}

export const initUserRepository = (client: PrismaClient): UserRepository => {
  const repo: UserRepository = {
    getUserByID: async (id) => {
      const user = await client.user.findUnique({
        where: { id },
      })
      return user ? mapToUser(user) : undefined
    },
    getUserByEmail: async (email) => {
      const user = await client.user.findUnique({
        where: { email: email },
      })
      return user ? mapToUser(user) : undefined
    },
    getUsers: async (limit: number) => {
      const users = await client.user.findMany({ take: limit })
      return users.map(mapToUser)
    },
    createUser: async (email, password) => {
      const user = await client.user.create({ data: { email, password } })
      return mapToUser(user)
    },
  }
  return repo
}
