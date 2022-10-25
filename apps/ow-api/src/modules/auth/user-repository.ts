import { PrismaClient } from "@dotkomonline/db"
<<<<<<< HEAD

=======
>>>>>>> 8489c56 (test out oidc login)
import { mapToUser, User } from "./user"

export interface UserRepository {
  getUserByID: (id: string) => Promise<User | undefined>
  getUsers: (limit: number) => Promise<User[]>
<<<<<<< HEAD
  createUser: (email: string, password: string) => Promise<User>
  getUserByEmail: (email: string) => Promise<User | undefined>
=======
  createUser: () => Promise<User>
>>>>>>> 8489c56 (test out oidc login)
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
<<<<<<< HEAD
    createUser: async (email, password) => {
      const user = await client.user.create({ data: { email, password } })
=======
    createUser: async () => {
      const user = await client.user.create({ data: {} })
>>>>>>> 8489c56 (test out oidc login)
      return mapToUser(user)
    },
  }
  return repo
}
