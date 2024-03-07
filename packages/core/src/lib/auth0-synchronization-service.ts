import { User, UserWrite } from "@dotkomonline/types"
import { UserService } from "../modules/user/user-service"
import { Auth0Repository } from "./auth0-repository"
import { logger } from "../../logger"

// Id token returned from Auth0. We don't want core to depend on next-auth, so we duplicate the type here.
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
   * If no record of the user exists in the local database, save it to the database.
   */
  createUser: (token: JWTToken) => Promise<User>

  /**
   * Synchronize record of user in database with user data from Auth0.
   */
  synchronizeUser: (user: User) => Promise<User | null>
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  // TODO: Include givenName and familyName when we gather this from our users.
  async createUser(token: JWTToken) {
    if (
      !token.email ||
      !token.sub ||
      !token.name
      //  || !token.givenName || !token.familyName
    ) {
      throw new Error("Missing user data in claims")
    }

    const userData: UserWrite = {
      auth0Sub: token.sub,
      studyYear: -1,
      email: token.email,
      name: token.name,
      // givenName: token.givenName,
      // familyName: token.familyName,
      lastSyncedAt: new Date(),
    }

    return this.userService.createUser(userData)
  }

  // if user.updatedAt is more than 1 day ago, update user
  async synchronizeUser(user: User) {
    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(Date.now() - oneDay)
    if (!user.lastSyncedAt || user.lastSyncedAt < oneDayAgo) {
      logger.log("info", "Synchronizing user with Auth0", { userId: user.id })
      const idpUser = await this.auth0Repository.getBySubject(user.auth0Sub)

      if (idpUser === null) {
        throw new Error("User does not exist in Auth0")
      }

      return this.userService.updateUser(user.id, {
        email: idpUser.email,
        name: idpUser.name,
        lastSyncedAt: new Date(),
        // givenName: idpUser.givenName,
        // familyName: idpUser.familyName,
      })
    }

    return null
  }
}
