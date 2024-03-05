import { User, UserWrite } from "@dotkomonline/types"
import { UserService } from "../modules/user/user-service"
import { Auth0Repository } from "./auth0-repository"

type JWTToken = {
  email?: string | null
  sub?: string | null
  name?: string | null
  givenName?: string | null
  familyName?: string | null
}

/**
 * Synchronize users in a local database user table with Auth0.
 */
export interface Auth0SynchronizationService {
  /**
   * Creates a new user in the local database using the provided JWT token.
   */
  createNewUser: (token: JWTToken) => Promise<User>

  /**
   * Synchronizes the provided user with data from Auth0. Only updates user if the user's updatedAt field is more than 1 day ago.
   */
  handleSyncUserWithAuth0: (user: User) => Promise<User | undefined>
}
export interface Auth0SynchronizationService {
  createNewUser: (token: JWTToken) => Promise<User>
  handleSyncUserWithAuth0: (user: User) => Promise<User | undefined>
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  async createNewUser(token: JWTToken) {
    if (!token.email || !token.sub || !token.name || !token.givenName || !token.familyName) {
      throw new Error("Missing user data in claims")
    }
    const userData: UserWrite = {
      auth0Sub: token.sub,
      studyYear: -1,
      email: token.email,
      name: token.name,
      givenName: token.givenName,
      familyName: token.familyName,
      lastSyncedAt: new Date(),
    }

    return this.userService.createUser(userData)
  }

  // if user.updatedAt is more than 1 day ago, update user
  async handleSyncUserWithAuth0(user: User) {
    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(Date.now() - oneDay)
    if (!user.lastSyncedAt || user.lastSyncedAt < oneDayAgo) {
      console.log("updating user", user.id, user.auth0Sub)
      const idpUser = await this.auth0Repository.getBySubject(user.auth0Sub)

      if (idpUser === undefined) {
        throw new Error("User does not exist in Auth0")
      }

      return this.userService.updateUser(user.id, {
        email: idpUser.email,
        givenName: idpUser.givenName,
        familyName: idpUser.familyName,
        name: `${idpUser.givenName} ${idpUser.familyName}`,
        lastSyncedAt: new Date(),
      })
    }
    return undefined
  }
}
