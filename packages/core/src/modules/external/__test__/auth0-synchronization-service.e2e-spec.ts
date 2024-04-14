import type { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { addHours } from "date-fns"
import type { Kysely } from "kysely"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { getAuth0UserMock } from "../../../../mock"
import { createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import {
  type NotificationPermissionsRepository,
  NotificationPermissionsRepositoryImpl,
} from "../../user/notification-permissions-repository"
import {
  type PrivacyPermissionsRepository,
  PrivacyPermissionsRepositoryImpl,
} from "../../user/privacy-permissions-repository"
import { type UserRepository, UserRepositoryImpl } from "../../user/user-repository"
import { type UserService, UserServiceImpl } from "../../user/user-service"
import { type Auth0Service, Auth0ServiceImpl } from "../auth0-service"
import { type Auth0SynchronizationService, Auth0SynchronizationServiceImpl } from "../auth0-synchronization-service"

// What's saved to auth0 on sign up with only email being gathered
const getFakeAuth0UserResponse = (
  data: GetUsers200ResponseOneOfInner,
  status?: number,
  statusText?: string
): ApiResponse<GetUsers200ResponseOneOfInner> =>
  ({
    data,
    headers: {},
    status: status ?? 200,
    statusText: statusText ?? "OK",
  }) as unknown as ApiResponse<GetUsers200ResponseOneOfInner> // to avoid having to write out headers fake data

interface ServerLayerOptions {
  db: Kysely<Database>
  auth0MgmtClient: ManagementClient
}

const createServiceLayer = async ({ db, auth0MgmtClient }: ServerLayerOptions) => {
  const auth0Repository: Auth0Service = new Auth0ServiceImpl(auth0MgmtClient)

  const userRepository: UserRepository = new UserRepositoryImpl(db)
  const privacyPermissionsRepository: PrivacyPermissionsRepository = new PrivacyPermissionsRepositoryImpl(db)
  const notificationPermissionsRepository: NotificationPermissionsRepository =
    new NotificationPermissionsRepositoryImpl(db)

  const auth0SynchronizationService: Auth0SynchronizationService = new Auth0SynchronizationServiceImpl(
    userRepository,
    auth0Repository
  )
  const userService: UserService = new UserServiceImpl(
    userRepository,
    privacyPermissionsRepository,
    notificationPermissionsRepository,
    auth0Repository,
    auth0SynchronizationService
  )

  return {
    userService,
    auth0Repository,
    auth0SynchronizationService,
  }
}

describe("auth0 synchronization service", () => {
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

    const updatedWithFakeDataUser = getFakeAuth0UserResponse(getAuth0UserMock({ email, auth0Id }), 200)
    auth0Mock.users.get.mockResolvedValue(updatedWithFakeDataUser)

    // first sync down to the local db. Should create user row in the db and populate with fake data.
    const syncedUser = await core.auth0SynchronizationService.handleUserSync(auth0Id, now)

    const dbUser = await core.userService.getById(syncedUser.id)
    expect(dbUser).toEqual(syncedUser)

    // Simulate an email change in the Auth0 dashboard or something.
    const updatedMail = "changed-in-dashboard@local.com"
    auth0Mock.users.get.mockResolvedValue(getFakeAuth0UserResponse(getAuth0UserMock({ email: updatedMail }), 200))

    // Run synchroinization again, simulating doing it 1hr later. However, since the user was just synced, the synchronization should not occur.
    const oneHourLater = addHours(now, 1)
    const updatedDbUser = await core.auth0SynchronizationService.handleUserSync(auth0Id, oneHourLater)
    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Attempt to sync the user again 25 hours after first sync. This time, the synchronization should occur.
    const twentyFiveHoursLater = addHours(now, 25)
    await core.auth0SynchronizationService.handleUserSync(auth0Id, twentyFiveHoursLater)

    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Clean up the testing context.
    await context.cleanup()
  })
})
