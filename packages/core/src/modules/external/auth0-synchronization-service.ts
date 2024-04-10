import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import type { UserRepository } from "../user/user-repository"
import type { Auth0Service } from "./auth0-service"
import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"
import { Auth0UserNotFoundError } from "./auth0-errors"

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
    private readonly auth0Service: Auth0Service
  ) {}

  async synchronizeUser(user: User) {
    const userId = user.id
    this.logger.log("info", "Synchronizing user with Auth0", { userId: userId })

    const auth0User = await this.auth0Service.getById(userId)

    if (auth0User === null) {
      throw new Auth0UserNotFoundError(userId)
    }

    if (auth0User.onBoarded === false) {
      throw new SyncError(`Cannot sync user that is not onboarded. User id: ${userId}`)
    }

    if (user === null) {
      this.logger.log("info", "User does not exist in local db, creating user", { userId: userId })

      const userData: UserWrite = {
        allergies: auth0User.allergies,
        email: auth0User.email,
        familyName: auth0User.familyName,
        givenName: auth0User.givenName,
        name: auth0User.name,
        phoneNumber: auth0User.phoneNumber,
        profilePicture: auth0User.profilePicture,
        studyYear: auth0User.studyYear,
        onBoarded: auth0User.onBoarded,
        emailVerified: auth0User.emailVerified,
        gender: auth0User.gender,

        lastSyncedAt: new Date(),
      }

      return this.userRepository.create(userData)
    }

    return await this.userRepository.update(user.id, {
      email: auth0User.email,
      name: auth0User.name,
      lastSyncedAt: new Date(),
    })
  }

  /**
   * Syncs down user if not synced within the last 24 hours.
   * @param userId The Auth0 subject of the user to synchronize.
   * @returns User
   */
  async handleUserSync(userId: string) {
    const user = await this.userRepository.getById(userId)

    if (!(user?.onBoarded === true)) {
      const user = await this.auth0Service.getById(userId)
      if (user === null) {
        throw new SyncError(`No user found in Auth0 for id ${userId}`)
      }
      if (user.onBoarded === false) {
        throw new SyncError(`Cannot sync user that is not onboarded. User id: ${userId}`)
      }

      return user
    }

    const oneDay = 1000 * 60 * 60 * 24
    const oneDayAgo = new Date(Date.now() - oneDay)

    const userShouldBeSynced = user.lastSyncedAt === null || user.lastSyncedAt < oneDayAgo
    if (userShouldBeSynced) {
      return this.synchronizeUser(user)
    }

    // User was not updated from Auth0
    return user
  }
}
