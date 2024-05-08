import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { Auth0UserNotFoundError } from "../external/auth0-errors"
import type { Auth0Repository } from "../external/auth0-repository"
import type { UserService } from "./user-service"

export interface Auth0SynchronizationService {
  updateUserInAuth0AndLocalDb(payload: UserWrite): Promise<User>
  ensureUserLocalDbIsSynced(sub: string, now: Date): Promise<User>
  // The frontend for onboarding users with fake data is not implemented yet. This is a temporary solution for DX purposes so we can work with users with poulate data.
  // When the onboarding is implemented, this method should be removed.
  populateUserWithFakeData(auth0Id: string, email?: string | null): Promise<void>
}

// Until we have gather this data from the user, this fake data is used as the initial data for new users
const FAKE_USER_EXTRA_SIGNUP_DATA: Omit<UserWrite, "email" | "id" | "auth0Id"> = {
  givenName: "firstName",
  familyName: "lastName",
  middleName: "middleName",
  name: "firstName middleName lastName",
  allergies: ["allergy1", "allergy2"],
  picture: "https://example.com/image.jpg",
  studyYear: -1,
  lastSyncedAt: new Date(),
  phone: "12345678",
  gender: "male",
}

export class Auth0SynchronizationServiceImpl implements Auth0SynchronizationService {
  private readonly logger: Logger = getLogger(Auth0SynchronizationServiceImpl.name)
  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  async populateUserWithFakeData(auth0Id: string, email?: string | null) {
    if (!email) {
      throw new Error("Did not get email in jwt")
    }

    try {
      // This fails if the user already exists
      const user = await this.userService.create({
        ...FAKE_USER_EXTRA_SIGNUP_DATA,
        email: email,
        auth0Id: auth0Id,
      })

      await this.updateUserInAuth0AndLocalDb(user)

      this.logger.info("info", "Populated user with fake data", { userId: user.id })
    } catch (error) {
      // User already exists, ignore duplicate key value violates unique constraint error from postgres
    }
  }

  async updateUserInAuth0AndLocalDb(data: UserWrite) {
    const result = await this.auth0Repository.update(data.auth0Id, data)
    await this.synchronizeUserAuth0ToLocalDb(result)
    return result
  }

  private async synchronizeUserAuth0ToLocalDb(userAuth0: User) {
    this.logger.info("Synchronizing user with Auth0 id %O", { userId: userAuth0.auth0Id })

    const updatedUser: User = {
      ...userAuth0,
      lastSyncedAt: new Date(),
    }

    const userDb = await this.userService.getByAuth0Id(userAuth0.auth0Id)

    if (userDb === null) {
      this.logger.info("User does not exist in local db, creating user for user %O", userAuth0.name)
      return this.userService.create(updatedUser)
    }

    this.logger.info("Updating user in local db for user %O", userAuth0.name)
    return this.userService.update(updatedUser)
  }

  /**
   * Syncs down user if not synced within the last 24 hours.
   * @param auth0UserId The Auth0 subject of the user to synchronize.
   * @returns User
   */
  async ensureUserLocalDbIsSynced(auth0UserId: string, now: Date) {
    const user = await this.userService.getByAuth0Id(auth0UserId)

    const oneDayAgo = addDays(now, -1)
    const userDoesNotNeedSync = user !== null && oneDayAgo < user.lastSyncedAt

    if (userDoesNotNeedSync) {
      return user
    }

    const userAuth0 = await this.auth0Repository.getByAuth0UserId(auth0UserId)

    if (userAuth0 === null) {
      throw new Auth0UserNotFoundError(auth0UserId)
    }

    return this.synchronizeUserAuth0ToLocalDb(userAuth0)
  }
}
