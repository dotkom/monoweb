import { User, UserWrite } from "@dotkomonline/types"
import { UserService } from "../user/user-service"
import { Auth0Repository } from "./auth0-repository"
import { getLogger, Logger } from "@dotkomonline/logger"

// Id token returned from Auth0. We don't want core to depend on next-auth, so we duplicate the type here.
type Auth0IdToken = {
  email?: string | null
  sub?: string | null
  name?: string | null
  givenName?: string | null
  familyName?: string | null
}

export interface Auth0SynchronizationService {
  /**
   * If no record of the user exists in the local database, save it to the database.
   */
  createUser(token: Auth0IdToken): Promise<User>

  /**
   * Auth0 is the source of truth for user data. We keep a local read only copy of the user data in the application database to make it easier to query and to avoid having to cache results from Auth0.
   * The only place user data is updated from is monoweb. Monoweb makes sure to keep the local user data in sync with Auth0 when updating user data.
   * 
   * However, it is possible that users are updated from the Auth0 dashboard or that an update succeeds to auth0 but the update to the local database fails. 
   * 
   * To make sure the db user table is synchronized with Auth0 on such occasions, users are synchronized with Auth0 every time they log in.
   * 
   * To avoid unnecessary load, this synchronization is only done once every 24 hours.
   * 
   */
  handleUserSync(user: User): Promise<void>

  /**
   * Handle synchronization of a user from Auth0 to the local database.
   */
  synchronizeUser(user: User): Promise<void>
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  private readonly logger: Logger = getLogger(Auth0SynchronizationServiceImpl.name)

  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  // TODO: Include givenName and familyName when we gather this from our users.
  async createUser(token: Auth0IdToken) {
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

  async synchronizeUser(user: User) {
    this.logger.log("info", "Synchronizing user with Auth0", { userId: user.id })
    const auth0User = await this.auth0Repository.getBySubject(user.auth0Sub)

    if (auth0User === null) {
      throw new Error("User does not exist in Auth0")
    }

    await this.userService.updateUser(user.id, {
      email: auth0User.email,
      name: auth0User.name,
      lastSyncedAt: new Date(),
    })
  }

  private userShouldBeSynchronized(user: User) {
    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(Date.now() - oneDay)

    return user.lastSyncedAt < oneDayAgo
  }

  async handleUserSync(user: User) {
    if (this.userShouldBeSynchronized(user)) {
      await this.synchronizeUser(user)
    }
  }
}
