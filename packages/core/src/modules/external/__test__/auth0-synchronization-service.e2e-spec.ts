import type { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import type { Kysely } from "kysely"
import { describe, expect, it, vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
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

const fakeAuth0GetUserResponse = (subject?: string, email?: string): ApiResponse<GetUsers200ResponseOneOfInner> =>
  ({
    data: {
      email: email ?? "user@example.com",
      email_verified: true,
      given_name: "John",
      family_name: "Doe",
      name: "John Doe",
      created_at: "2024-02-01T00:00:00.000Z",
      updated_at: "2024-03-17T00:00:00.000Z",
      identities: [
        {
          connection: "Username-Password-Authentication",
          provider: "auth0",
          user_id: "00000000-0000-0000-0000-000000000000",
          isSocial: false,
        },
      ],
      user_id: subject ?? "auth0|00000000-0000-0000-0000-000000000000",
      picture: "https://example.com/avatar.png",
      nickname: "mockuser",
      multifactor: ["guardian"],
      multifactor_last_modified: "2024-02-01T00:00:00.000Z",
      last_password_reset: "2024-02-18T00:00:00.000Z",
      last_ip: "192.168.1.1",
      last_login: "2024-03-17T00:00:00.000Z",
      logins_count: 10,
    },
    headers: {},
    status: 200,
    statusText: "OK",
  }) as unknown as ApiResponse<GetUsers200ResponseOneOfInner> // mock response is missing some access token stuff and header methods. This fake data is taken from a real response from the sdk.

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

    const subject = "auth0|00000000-0000-0000-0000-000000000000"
    const email = "starting-email@local.com"

    // The user has signed up thorugh Auth0 sign up page.
    const signedUpUser = fakeAuth0GetUserResponse(subject, email)
    auth0Mock.users.get.mockResolvedValue(signedUpUser)

    // first sync down to the local db. Should create user row in the db.
    const syncedUser = await core.auth0SynchronizationService.handleUserSync(subject)
    const dbUser = await core.userService.getById(subject)
    expect(dbUser).toEqual(syncedUser)

    // Simulate an email change in the Auth0 dashboard or something.
    const updatedMail = "changed-in-dashboard@local.com"
    const updatedAuth0User = fakeAuth0GetUserResponse(subject, updatedMail)
    auth0Mock.users.get.mockResolvedValue(updatedAuth0User)

    // Run synchroinization again. However, since the user was just synced, the synchronization should not occur.
    const updatedDbUser = await core.auth0SynchronizationService.handleUserSync(subject)
    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Advance the system time by 25 hours to simulate passing the 24-hour threshold.
    const userShouldSyncAgainTime = new Date(new Date().getTime() + 25 * 60 * 60 * 1000)
    vi.setSystemTime(userShouldSyncAgainTime)

    // Attempt to sync the user again. This time, the synchronization should occur.
    await core.auth0SynchronizationService.handleUserSync(subject)

    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Clean up the testing context.
    await context.cleanup()
  })
})
