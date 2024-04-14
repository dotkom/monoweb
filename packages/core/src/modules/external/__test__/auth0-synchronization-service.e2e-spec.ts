import type { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import type { UserWrite } from "@dotkomonline/types"
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

const getFakeAuth0User = (write?: Partial<UserWrite>): GetUsers200ResponseOneOfInner =>
  ({
    user_id: write?.id ?? "auth0|test",
    email: write?.email ?? "fakeemail@gmai.com",
    given_name: write?.givenName ?? "Ola",
    family_name: write?.familyName ?? "Nordmann",
    name: write?.name ?? "Ola Mellomnavn Nordmann",
    picture: write?.picture ?? "https://example.com/image.jpg",
    app_metadata: {
      study_year: write?.studyYear ?? -1,
      last_synced_at: write?.lastSyncedAt ?? new Date(),
    },
    user_metadata: {
      allergies: write?.allergies ?? ["gluten"],
      gender: write?.gender ?? "male",
      phone: write?.phone ?? "004712345678",
    },
  }) as unknown as GetUsers200ResponseOneOfInner

// What's saved to auth0 on sign up with only email being gathered
const getFakeAuth0UserWithOnlyEmailAndName = (write?: Partial<UserWrite>): GetUsers200ResponseOneOfInner =>
  ({
    user_id: write?.id ?? "auth0|test",
    email: write?.email ?? "fakeemail@gmai.com",
    name: write?.name ?? "fakeemail@gmai.com",
    app_metadata: {},
    user_metadata: {},
  }) as unknown as GetUsers200ResponseOneOfInner

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

    const id = "auth0|00000000-0000-0000-0000-000000000000"
    const email = "starting-email@local.com"

    const initialPostSignupAuth0User = getFakeAuth0UserResponse(
      getFakeAuth0UserWithOnlyEmailAndName({ email, id }),
      200
    )

    const updatedWithFakeDataUser = getFakeAuth0UserResponse(getFakeAuth0User({ email, id }), 200)

    // The user has signed up thorugh Auth0 sign up page.
    auth0Mock.users.get.mockResolvedValue(initialPostSignupAuth0User)
    auth0Mock.users.update.mockResolvedValue(updatedWithFakeDataUser)

    // first sync down to the local db. Should create user row in the db and populate with fake data.
    const syncedUser = await core.auth0SynchronizationService.handleUserSync(id)

    const dbUser = await core.userService.getById(id)
    expect(dbUser).toEqual(syncedUser)

    // Simulate an email change in the Auth0 dashboard or something.
    const updatedMail = "changed-in-dashboard@local.com"
    auth0Mock.users.get.mockResolvedValue(getFakeAuth0UserResponse(getFakeAuth0User({ email: updatedMail }), 200))

    // Run synchroinization again. However, since the user was just synced, the synchronization should not occur.
    const updatedDbUser = await core.auth0SynchronizationService.handleUserSync(id)
    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Advance the system time by 25 hours to simulate passing the 24-hour threshold.
    const userShouldSyncAgainTime = new Date(new Date().getTime() + 25 * 60 * 60 * 1000)
    vi.setSystemTime(userShouldSyncAgainTime)

    // Attempt to sync the user again. This time, the synchronization should occur.
    await core.auth0SynchronizationService.handleUserSync(id)

    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Clean up the testing context.
    await context.cleanup()
  })
})
