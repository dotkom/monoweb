import { User, UserWrite } from "@dotkomonline/types"
import { OAuth2Api as HydraApiClient } from "@ory/client"
import argon2 from "argon2"

import { NotFoundError } from "../../errors/errors"
import { UserRepository } from "./user-repository"

type RedirectLink = { redirectTo: string }

export interface UserService {
  getUser: (id: User["id"]) => Promise<User>
  getUsers: (limit: number) => Promise<User[]>
  signUp: (userInsert: UserWrite, password: string) => Promise<User & { password: string }>
  login: (email: string, password: string, challenge: string, remember?: boolean) => Promise<RedirectLink>
  consent: (challenge: string) => Promise<RedirectLink & { user?: User }>
  skipLogin: (challenge: string) => Promise<RedirectLink | { message: string }>
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
    signUp: async (userInsert, password) => {
      const hashedPassword = await argon2.hash(password)
      const user = await userRepository.createUser(userInsert, hashedPassword)
      if (!user) {
        throw new Error("Failed to create user")
      }
      return { ...user, password: hashedPassword }
    },

    login: async (email, password, challenge, remember = false) => {
      const hashedPassword = await userRepository.getHashedPassword(email)
      if (!hashedPassword) {
        throw new Error("No user found with this email")
      }
      const correctPassword = await argon2.verify(hashedPassword, password)
      if (!correctPassword) {
        const rejectRes = await hydraAdmin.rejectOAuth2LoginRequest(challenge, {
          error: "access_denied",
          error_description: "The resource owner denied the request",
        })
        return { redirectTo: rejectRes.data.redirect_to }
      }
      const res = await hydraAdmin.acceptOAuth2LoginRequest(challenge, {
        subject: email,
        remember: remember,
        remember_for: 3600,
      })

      return { redirectTo: res.data.redirect_to }
    },
    consent: async (challenge) => {
      // This is the consent screen for the user.
      // Currently, it will always consent to all scopes
      // const res = await hydraAdmin.getOAuth2ConsentRequest(challenge)
      // const grantScope = res.data.requested_scope || ["openid", "email", "profile"]
      const res = await hydraAdmin.getOAuth2ConsentRequest(challenge)
      const grantScope = ["openid", "email", "profile"]

      // if (!res.data.skip) {
      //   return { requestedScopes: grantScope, clientName: res.data.client?.client_name || "Unknown" }
      // }

      // let session: AcceptOAuth2ConsentRequestSession = {
      //   access_token: {
      //     // foo: 'bar'
      //   },
      //   id_token: {
      //     // baz: 'bar'
      //   },
      // }
      if (!res.data.subject) {
        throw new Error("No subject in auth found")
      }

      const user = await userRepository.getUserByEmail(res.data.subject)
      const consentRes = await hydraAdmin.acceptOAuth2ConsentRequest(challenge, {
        grant_scope: grantScope,
        session: {
          id_token: {
            user: {
              ...user,
              password: undefined,
            },
          },
        },
      })
      return { redirectTo: consentRes.data.redirect_to, user }
    },
    skipLogin: async (challenge) => {
      const { data } = await hydraAdmin.getOAuth2LoginRequest(challenge)
      if (!data.skip) {
        return { message: "Login has expired" }
      }
      const { data: loginRes } = await hydraAdmin.acceptOAuth2LoginRequest(data.challenge, {
        subject: data.subject,
      })
      return { redirectTo: loginRes.redirect_to }
    },
  }
  return service
}
