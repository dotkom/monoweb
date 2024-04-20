import { type Logger, getLogger } from "@dotkomonline/logger"
import type { PrivacyPermissionsWrite, User, UserId, UserWrite } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { Auth0UserNotFoundError } from "../external/auth0-errors"
import type { Auth0Repository } from "../external/auth0-repository"
import type { UserService } from "./user-service"
import type { Cursor } from "../../utils/db-utils"

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

export interface SyncedUserService {
  update(payload: UserWrite): Promise<User>
  handlePopulateUserWithFakeData(auth0Id: string, email?: string | null): Promise<void>
  create(data: UserWrite): Promise<User>
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

export class SyncedUserServiceImpl implements SyncedUserService, UserService {
  private readonly logger: Logger = getLogger(SyncedUserServiceImpl.name)
  constructor(
    private readonly userService: UserService,
    private readonly auth0Repository: Auth0Repository
  ) {}

  async create(data: UserWrite) {
    return this.userService.create(data)
  }

  // This function will be removed when we gather real data
  async handlePopulateUserWithFakeData(auth0Id: string, email?: string | null) {
    if (!email) {
      throw new Error("Did not get email in jwt")
    }

    try {
      await this.auth0Repository.getByAuth0UserId(auth0Id) // this fails if any attributes are missing in auth0
    } catch (e) {
      console.log("Received error when trying to get user from auth0", e)
      console.log("Assuming user is missing data in auth0, populating with fake data")

      const user = await this.create({
        ...FAKE_USER_EXTRA_SIGNUP_DATA,
        email: email,
        auth0Id: auth0Id,
      })

      await this.auth0Repository.update(auth0Id, {
        ...FAKE_USER_EXTRA_SIGNUP_DATA,
        email,
        id: user.id,
        auth0Id,
      })
    }
  }

  async update(data: UserWrite) {
    const result = await this.auth0Repository.update(data.auth0Id, data)
    await this.synchronizeUser(result)
    return result
  }

  async synchronizeUser(userAuth0: User) {
    this.logger.log("info", "Synchronizing user with Auth0 id", { userId: userAuth0.auth0Id })

    const updatedUser: UserWrite = {
      ...userAuth0,
      lastSyncedAt: new Date(),
    }

    const userDb = await this.userService.getById(userAuth0.id)

    if (userDb === null) {
      this.logger.log("info", "User does not exist in local db, creating user for user ", userAuth0.name)
      return this.userService.create(updatedUser)
    }

    this.logger.log("info", "Updating user in local db for user ", userAuth0.name)
    return await this.userService.update(updatedUser)
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

    return this.synchronizeUser(userAuth0)
  }
  getAll(limit: number) {
    return this.userService.getAll(limit)
  }

  getById(id: string) {
    return this.userService.getById(id)
  }

  getByAuth0Id(auth0Id: string) {
    return this.userService.getByAuth0Id(auth0Id)
  }

  getPrivacyPermissionsByUserId(id: string) {
    return this.userService.getPrivacyPermissionsByUserId(id)
  }

  searchByFullName(searchQuery: string, take: number, cursor?: Cursor) {
    return this.userService.searchByFullName(searchQuery, take, cursor)
  }

  updatePrivacyPermissionsForUserId(id: UserId, data: Partial<Omit<PrivacyPermissionsWrite, "userId">>) {
    return this.userService.updatePrivacyPermissionsForUserId(id, data)
  }
}
