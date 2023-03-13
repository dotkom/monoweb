import { User, UserWrite } from "@dotkomonline/types"
import { OAuth2Api as HydraApiClient } from "@ory/client"

import { NotFoundError } from "../../errors/errors"
import { UserRepository } from "./user-repository"

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>
  getUsers: (limit: number) => Promise<User[]>
}

export const initUserService = (userRepository: UserRepository, hydraAdmin: HydraApiClient) => {
  const service: UserService = {
    getUser: async (id) => {
      const user = await userRepository.getUserByID(id)
      if (!user) throw new NotFoundError(`User with ID:${id} not found`)
      return user
    },
    getUsers: async (limit) => {
      const users = await userRepository.getUsers(limit)
      return users
    },
  }
  return service
}
