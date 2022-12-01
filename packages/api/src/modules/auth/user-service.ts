import { User } from "@dotkomonline/types"
import { Configuration, OAuth2Api } from "@ory/client"
import argon2 from "argon2"

import { NotFoundError } from "../../errors/errors"
import { UserRepository } from "./user-repository"

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>
  getUsers: (limit: number) => Promise<User[]>
  register: (email: string, password: string) => Promise<User>
  signIn: (email: string, password: string, challenge: string) => Promise<boolean>
}

export const initUserService = (userRepository: UserRepository): UserService => {
  const hydraAdmin = new OAuth2Api(
    new Configuration({
      basePath: process.env.HYDRA_ADMIN_URL,
    })
  )

  return {
    getUser: async (id) => {
      const user = await userRepository.getUserByID(id)
      if (!user) throw new NotFoundError(`User with ID:${id} not found`)
      return user
    },
    getUsers: async (limit) => {
      const users = await userRepository.getUsers(limit)
      return users
    },
    register: async (email, password) => {
      const hashedPassword = await argon2.hash(password)
      const user = await userRepository.createUser(email, hashedPassword)
      if (!user) {
        throw new Error("Failed to create user")
      }
      return user
    },
    signIn: async (email, password, challenge) => {
      const { data } = await hydraAdmin.getOAuth2LoginRequest(challenge)
      if (data.skip) {
        // You can apply logic here, for example update the number of times the user logged in.
        const { data: body } = await hydraAdmin.acceptOAuth2LoginRequest(challenge, {
          subject: String(data.subject),
        })
        console.log(body.redirect_to)
      }
      const user = await userRepository.getUserByEmail(email)
      if (!user) {
        throw new Error("User does not exist")
      }
      const correctPassword = await argon2.verify(user.password, password)
      if (!correctPassword) {
        throw new Error("Invalid password")
      }
      return true
    },
  }
}
