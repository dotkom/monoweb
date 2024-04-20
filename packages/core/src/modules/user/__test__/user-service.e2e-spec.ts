import { createEnvironment } from "@dotkomonline/env"
import type { ManagementClient } from "auth0"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import { getUserMock, mockAuth0UserResponse } from "../../../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"

import type { Database } from "@dotkomonline/db"
import type { Kysely } from "kysely"
import { type Auth0Repository, Auth0RepositoryImpl } from "../../external/auth0-repository"
import {
  type NotificationPermissionsRepository,
  NotificationPermissionsRepositoryImpl,
} from "../notification-permissions-repository"
import { type PrivacyPermissionsRepository, PrivacyPermissionsRepositoryImpl } from "../privacy-permissions-repository"
import { type SyncedUserService, SyncedUserServiceImpl } from "../synced-user-service"
import { type UserRepository, UserRepositoryImpl } from "../user-repository"
import { type UserService, UserServiceImpl } from "../user-service"

export type ServiceLayer = Awaited<ReturnType<typeof createServiceLayer>>

interface ServerLayerOptions {
  db: Kysely<Database>
  auth0MgmtClient: ManagementClient
}

const createServiceLayer = async ({ db, auth0MgmtClient }: ServerLayerOptions) => {
  const auth0Repository: Auth0Repository = new Auth0RepositoryImpl(auth0MgmtClient)

  const userRepository: UserRepository = new UserRepositoryImpl(db)
  const privacyPermissionsRepository: PrivacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository: NotificationPermissionsRepository =
    new NotificationPermissionsRepositoryImpl(db)

  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository
  )

  const syncedUserService: SyncedUserService = new SyncedUserServiceImpl(userService, auth0Repository)

  return {
    userService,
    auth0Repository,
    syncedUserService,
  }
}

describe("users", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction
  let auth0Client: DeepMockProxy<ManagementClient>

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "user")
    cleanup = context.cleanup
    auth0Client = mockDeep<ManagementClient>()
    core = await createServiceLayer({ db: context.kysely, auth0MgmtClient: auth0Client })
  })

  afterEach(async () => {
    await cleanup()
  })

  it("will find users by their user id", async () => {
    const user = await core.userService.create(getUserMock())

    const match = await core.userService.getById(user.id)
    expect(match).toEqual(user)
    const fail = await core.userService.getById(ulid())
    expect(fail).toBeNull()
  })

  it("can update users given their id", async () => {
    const initialGivenName = "Test"
    const updatedGivenName = "Updated Test"

    const fakeInsert = getUserMock({
      givenName: initialGivenName,
    })

    const insertedUser = await core.userService.create(fakeInsert)

    const auth0UpdateResponse = mockAuth0UserResponse({
      givenName: updatedGivenName,
      id: insertedUser.id,
      auth0Id: insertedUser.auth0Id,
    })

    const auth0ResponsePromise = new Promise<typeof auth0UpdateResponse>((resolve) => {
      resolve(auth0UpdateResponse)
    })

    // Mock the auth0 update call
    auth0Client.users.update.mockReturnValueOnce(auth0ResponsePromise)

    const updatedUserWrite = {
      ...insertedUser,
      givenName: updatedGivenName,
    }

    const updated = await core.userService.update(updatedUserWrite)

    expect(updated.givenName).toEqual(updatedGivenName)
  })
})
