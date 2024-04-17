import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"
import type { UserRepository } from "../user/user-repository"
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
  handleUserSync(sub: string, now: Date): Promise<User>

  /**
   * Synchronizes a user from Auth0 to the local database
   * @param user The user to synchronize
   * @returns The synchronized user object.
   */
  synchronizeUser(user: User): Promise<User>
}

export class SyncError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.InternalServerError, detail)
  }
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  private readonly logger: Logger = getLogger(Auth0SynchronizationServiceImpl.name)

  constructor(
    private readonly userRepository: UserRepository,
    private readonly auth0Service: Auth0Repository
  ) {}

  async synchronizeUser(userAuth0: User) {
    this.logger.log("info", "Synchronizing user with Auth0 id", { userId: userAuth0.auth0Id })

    const updatedUser: UserWrite = {
      ...userAuth0,
      lastSyncedAt: new Date(),
    }

    const userDb = await this.userRepository.getById(userAuth0.id)

    if (userDb === null) {
      this.logger.log("info", "User does not exist in local db, creating user for user ", userAuth0.name)
      return this.userRepository.create(updatedUser)
    }

    this.logger.log("info", "Updating user in local db for user ", userAuth0.name)
    return await this.userRepository.update(userDb.id, updatedUser)
  }

  /**
   * Syncs down user if not synced within the last 24 hours.
   * @param auth0UserId The Auth0 subject of the user to synchronize.
   * @returns User
   */
  async handleUserSync(auth0UserId: string, now: Date) {
    const userDB = await this.userRepository.getByAuth0Id(auth0UserId)

    const oneDayAgo = addDays(now, -1)
    const userDoesNotNeedSync = userDB?.lastSyncedAt && oneDayAgo < userDB.lastSyncedAt

    if (userDoesNotNeedSync) {
      return userDB
    }

    const userAuth0 = await this.auth0Service.getByAuth0UserId(auth0UserId)

    if (userAuth0 === null) {
      throw new SyncError(`No user found in Auth0 for id ${auth0UserId}`)
    }

    return this.synchronizeUser(userAuth0)
  }
}
