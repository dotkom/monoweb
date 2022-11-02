import { Configuration, V0alpha2Api } from "@ory/client"
import bcrypt from "bcrypt"
import invariant from "tiny-invariant"

import { NotFoundError } from "../../errors/errors"
import { User } from "./user"
import { UserRepository } from "./user-repository"

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>
  getUsers: (limit: number) => Promise<User[]>
  register: (email: string, password: string) => Promise<User>
  signIn: (email: string, password: string, challenge: string) => Promise<boolean>
}

export const initUserService = (userRepository: UserRepository): UserService => {
  const hydraAdmin = new V0alpha2Api(
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
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      const user = await userRepository.createUser(email, hashedPassword)
      return user
    },
    signIn: async (email, password, challenge) => {
      const { data } = await hydraAdmin.adminGetOAuth2LoginRequest(challenge)
      if (data.skip) {
        // You can apply logic here, for example update the number of times the user logged in.
        const { data: body } = await hydraAdmin.adminAcceptOAuth2LoginRequest(challenge, {
          subject: String(data.subject),
        })
        console.log(body.redirect_to)
      }
      const user = await userRepository.getUserByEmail(email)
      invariant(user, "User does not exist")
      const valid = await bcrypt.compare(password, user.password)
      invariant(valid, "Invalid password")
      return true
    },
  }
}
