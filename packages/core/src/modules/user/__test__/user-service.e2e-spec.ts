import crypto from "node:crypto"
import { createEnvironment } from "@dotkomonline/env"
import type { UserWrite } from "@dotkomonline/types"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import assert from "../../../../assert"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayerForUserTests } from "./core"

const getFakeUser = (write?: Partial<UserWrite>): UserWrite => ({
  auth0Id: write?.auth0Id ?? crypto.randomUUID(),
  studyYear: write?.studyYear ?? 1,
  email: write?.email ?? "testuser@local.com",
  name: write?.name ?? "Test User",
  lastSyncedAt: write?.lastSyncedAt ?? new Date(),
  allergies: write?.allergies ?? [],
  createdAt: write?.createdAt ?? new Date(),
  emailVerified: write?.emailVerified ?? false,
  familyName: write?.familyName ?? "User",
  gender: write?.gender ?? "other",
  givenName: write?.givenName ?? "Test",
  onBoarded: write?.onBoarded ?? true,
  phoneNumber: write?.phoneNumber ?? "",
  profilePicture: write?.profilePicture ?? "",
  updatedAt: write?.updatedAt ?? new Date(),
})

describe("users", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction
  let auth0Client: DeepMockProxy<ManagementClient>

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "user")
    cleanup = context.cleanup
    auth0Client = mockDeep<ManagementClient>()
    core = await createServiceLayerForUserTests({ db: context.kysely, auth0MgmtClient: auth0Client })
  })

  afterEach(async () => {
    await cleanup()
  })

  it("can create new users", async () => {
    const none = await core.userService.getAllUsers(100)
    expect(none).toHaveLength(0)

    const user = await core.userService.createUser(getFakeUser())

    const users = await core.userService.getAllUsers(100)
    expect(users).toContainEqual(user)
  })

  it("will not allow two users the same subject", async () => {
    const subject = crypto.randomUUID()
    const first = await core.userService.createUser(getFakeUser({ auth0Id: subject }))
    expect(first).toBeDefined()
    await expect(core.userService.createUser(getFakeUser({ auth0Id: subject }))).rejects.toThrow()
  })

  it("will find users by their user id", async () => {
    const user = await core.userService.createUser(getFakeUser())

    const match = await core.userService.getById(user.auth0Id)
    expect(match).toEqual(user)
    const fail = await core.userService.getById("nonexistent-id")
    expect(fail).toBeNull()
  })

  it("can update users given their id", async () => {
    await expect(core.userService.updateUser("nonexistent-id", {})).rejects.toThrow()

    const intialUser = getFakeUser({
      givenName: "Initial Name",
    })

    await core.userRepository.create(intialUser)

    const user = await core.userService.getById(intialUser.auth0Id)

    assert(user !== null, new Error("User not found"))

    const auth0UpdatedUserResponse = {
      data: {
        user_id: user.auth0Id,
        email: user.email,
        email_verified: user.emailVerified,
        created_at: new Date().toString(),
        updated_at: new Date().toString(),
        app_metadata: {
          ...user,
          givenName: "Updated Name",
        },
      },
      status: 200,
      statusText: "OK",
    } as unknown as ApiResponse<GetUsers200ResponseOneOfInner>

    const auth0ResponsePromise = new Promise<typeof auth0UpdatedUserResponse>((resolve) => {
      resolve(auth0UpdatedUserResponse)
    })

    auth0Client.users.update.mockReturnValueOnce(auth0ResponsePromise)

    const updated = await core.userService.updateUser(intialUser.auth0Id, intialUser)

    expect(user.givenName).toEqual("Initial Name")
    expect(updated.givenName).toEqual("Updated Name")
  })
})
