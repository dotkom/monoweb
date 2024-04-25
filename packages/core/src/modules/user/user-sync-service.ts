import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { Auth0UserNotFoundError } from "../external/auth0-errors"
import type { Auth0Repository } from "../external/auth0-repository"
import type { UserRepository } from "./user-repository"

export interface UserSyncService {
  update(payload: UserWrite): Promise<User>
  handleUserSync(sub: string, now: Date): Promise<User>
}

export class Auth0UserSyncService implements UserSyncService {
  private readonly logger: Logger = getLogger(Auth0UserSyncService.name)
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auth0Repository: Auth0Repository
  ) {}

  async create(data: UserWrite) {
    return this.userRepository.create(data)
  }

  async update(data: UserWrite) {
    const result = await this.auth0Repository.update(data.auth0Id, data)
    await this.syncUser(result)
    return result
  }

  async syncUser(userAuth0: User) {
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
    return this.userRepository.update(userAuth0.id, updatedUser)
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

    const userAuth0 = await this.auth0Repository.getByAuth0UserId(auth0UserId)

    if (userAuth0 === null) {
      throw new Auth0UserNotFoundError(auth0UserId)
    }

    return this.syncUser(userAuth0)
  }
}
