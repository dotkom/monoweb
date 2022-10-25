import { NotFoundError } from "../../errors/errors"
import { InsertUser, User } from "./user"
import { UserRepository } from "./user-repository"

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>
  getUsers: (limit: number) => Promise<User[]>
  register: (payload: InsertUser) => Promise<User>
}

export const initUserService = (userRepository: UserRepository): UserService => ({
  getUser: async (id) => {
    const user = await userRepository.getUserByID(id)
    if (!user) throw new NotFoundError(`User with ID:${id} not found`)
    return user
  },
  getUsers: async (limit) => {
    const users = await userRepository.getUsers(limit)
    return users
  },
  register: async (payload) => {
    const user = await userRepository.createUser()
    return user
  },
})
