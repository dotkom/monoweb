import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import { IllegalStateError } from "../../error"
import type { UserService } from "../user/user-service"
import type { Auth0Repository } from "./auth0-repository"

export interface Auth0SynchronizationService {
  /**
   * Auth0 is the source of truth for user data. We keep a local read only copy of the user data in the application database to make it easier to query and to avoid having to cache results from Auth0.
   *
   * The only place user data is updated from is monoweb. Monoweb makes sure to keep the local user data in sync with Auth0 when updating user data.
   * However, the monoweb db can still get out of sync with the auth0 db. It is possible that users are updated from the Auth0 dashboard or that a monoweb update succeeds to auth0 but the update to the local database fails.
   *
   * To make sure the db user table is synchronized with Auth0 on such occasions, this method synchronizes the user data from Auth0 to the local database based on some given criteria left to the implementation.
   *
   * @returns The synchronized user object.
   */
  handleUserSync(sub: string): Promise<User>
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  private readonly logger: Logger = getLogger(Auth0SynchronizationServiceImpl.name)

  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  private async synchronizeUser(auth0Subject: string) {
    const auth0User = await this.auth0Repository.getBySubject(auth0Subject)

    if (auth0User === null) {
      throw new IllegalStateError("Missing user data in claims")
    }

    const user = await this.userService.getUserBySubject(auth0Subject)

    if (user === undefined) {
      const userData: UserWrite = {
        auth0Sub: auth0User.subject,
        studyYear: -1,
        email: auth0User.email,
        name: auth0User.name,
        lastSyncedAt: new Date(),
      }

      return this.userService.createUser(userData)
    }

    return await this.userService.updateUser(user.id, {
      email: auth0User.email,
      name: auth0User.name,
      lastSyncedAt: new Date(),
    })
  }

  /**
   * Syncs down user if not synced within the last 24 hours.
   * @param auth0Sub The Auth0 subject of the user to synchronize.
   * @returns User
   */
  async handleUserSync(auth0Sub: string) {
    const user = await this.userService.getUserBySubject(auth0Sub)

    if (user === undefined) {
      return this.synchronizeUser(auth0Sub)
    }

    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(Date.now() - oneDay)

    const userShouldBeSynced = user.lastSyncedAt < oneDayAgo
    if (userShouldBeSynced) {
      this.logger.info("Syncing user from Auth0: %s", auth0Sub)
      return this.synchronizeUser(user.auth0Sub)
    }

    // User was not updated from Auth0
    return user
  }
}
