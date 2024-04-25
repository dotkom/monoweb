import { type Logger, getLogger } from "@dotkomonline/logger"
import type { User, UserWrite } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { Auth0UserNotFoundError } from "../external/auth0-errors"
import type { Auth0Repository } from "../external/auth0-repository"
import type { UserService } from "./user-service"

export interface UserSyncService {
  update(payload: UserWrite): Promise<User>
  handleUserSync(sub: string, now: Date): Promise<User>
  handlePopulateUserWithFakeData(auth0Id: string, email?: string | null): Promise<void>
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

export class Auth0UserSyncService implements UserSyncService {
  private readonly logger: Logger = getLogger(Auth0UserSyncService.name)
  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  async handlePopulateUserWithFakeData(auth0Id: string, email?: string | null) {
    if (!email) {
      throw new Error("Did not get email in jwt")
    }

    try {
      // This fails if the user already exists
      const user = await this.create({
        ...FAKE_USER_EXTRA_SIGNUP_DATA,
        email: email,
        auth0Id: auth0Id,
      })

      await this.update(user)
    } catch (error) {
      // do nothing
    }
  }

  async create(data: UserWrite) {
    return this.userService.create(data)
  }

  async update(data: UserWrite) {
    const result = await this.auth0Repository.update(data.auth0Id, data)
    await this.syncUser(result)
    return result
  }

  async syncUser(userAuth0: User) {
    this.logger.log("info", "Synchronizing user with Auth0 id", { userId: userAuth0.auth0Id })

    const updatedUser: User = {
      ...userAuth0,
      lastSyncedAt: new Date(),
    }

    const userDb = await this.userService.getById(userAuth0.id)

    if (userDb === null) {
      this.logger.log("info", "User does not exist in local db, creating user for user ", userAuth0.name)
      return this.userService.create(updatedUser)
    }

    this.logger.log("info", "Updating user in local db for user ", userAuth0.name)
    return this.userService.update(updatedUser)
  }

  /**
   * Syncs down user if not synced within the last 24 hours.
   * @param auth0UserId The Auth0 subject of the user to synchronize.
   * @returns User
   */
  async handleUserSync(auth0UserId: string, now: Date) {
    const userDB = await this.userService.getByAuth0Id(auth0UserId)

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
