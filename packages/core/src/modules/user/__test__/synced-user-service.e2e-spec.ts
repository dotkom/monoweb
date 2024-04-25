import type { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import type { ManagementClient } from "auth0"
import { addHours } from "date-fns"
import type { Kysely } from "kysely"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { mockAuth0UserResponse } from "../../../../mock"
import { createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type Auth0Repository, Auth0RepositoryImpl } from "../../external/auth0-repository"
import {
  type NotificationPermissionsRepository,
  NotificationPermissionsRepositoryImpl,
} from "../notification-permissions-repository"
import { type PrivacyPermissionsRepository, PrivacyPermissionsRepositoryImpl } from "../privacy-permissions-repository"
import { type UserRepository, UserRepositoryImpl } from "../user-repository"
import { type UserService, UserServiceImpl } from "../user-service"
import { Auth0SynchronizationServiceImpl, type Auth0SynchronizationService } from "../auth0-synchronization-service"

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

  const syncedUserService: Auth0SynchronizationService = new Auth0SynchronizationServiceImpl(userService, auth0Repository)

  return {
    userService,
    auth0Repository,
    syncedUserService,
  }
}

describe("synced user service", () => {
  // NOTE: Uses `setSystemTime`, this persists between tests
  it("verifies synchronization works", async () => {
    // Set up test db and  service layer with a mocked Auth0 management client.
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "auth0_synchronization")
    const auth0Mock = mockDeep<ManagementClient>()
    const core = await createServiceLayer({ db: context.kysely, auth0MgmtClient: auth0Mock })

    const auth0Id = "auth0|00000000-0000-0000-0000-000000000000"
    const email = "starting-email@local.com"
    const now = new Date("2021-01-01T00:00:00Z")

    const updatedWithFakeDataUser = mockAuth0UserResponse({ email, auth0Id }, 200)
    auth0Mock.users.get.mockResolvedValue(updatedWithFakeDataUser)

    // first sync down to the local db. Should create user row in the db and populate with fake data.
    const syncedUser = await core.syncedUserService.handleUserSync(auth0Id, now)

    const dbUser = await core.userService.getById(syncedUser.id)
    expect(dbUser).toEqual(syncedUser)

    // Simulate an email change in the Auth0 dashboard or something.
    const updatedMail = "changed-in-dashboard@local.com"
    auth0Mock.users.get.mockResolvedValue(mockAuth0UserResponse({ email: updatedMail }, 200))

    // Run synchroinization again, simulating doing it 1hr later. However, since the user was just synced, the synchronization should not occur.
    const oneHourLater = addHours(now, 1)
    const updatedDbUser = await core.syncedUserService.handleUserSync(auth0Id, oneHourLater)
    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Attempt to sync the user again 25 hours after first sync. This time, the synchronization should occur.
    const twentyFiveHoursLater = addHours(now, 25)
    await core.syncedUserService.handleUserSync(auth0Id, twentyFiveHoursLater)

    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Clean up the testing context.
    await context.cleanup()
  })
})
