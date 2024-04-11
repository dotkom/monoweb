import { createEnvironment } from "@dotkomonline/env"
import type { UserCreate } from "@dotkomonline/types"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import assert from "../../../../assert"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayerForUserTests } from "./core"

const getFakeUser = (write?: Partial<UserCreate>): UserCreate => ({
  studyYear: write?.studyYear ?? 1,
  name: write?.name ?? "Test User",
  lastSyncedAt: write?.lastSyncedAt ?? new Date(),
  allergies: write?.allergies ?? [],
  familyName: write?.familyName ?? "User",
  gender: write?.gender ?? "other",
  givenName: write?.givenName ?? "Test",
  onBoarded: write?.onBoarded ?? true,
  phoneNumber: write?.phoneNumber ?? "",
  profilePicture: write?.profilePicture ?? "",
  auth0Id: write?.auth0Id ?? "auth0|test",
  createdAt: write?.createdAt ?? new Date(),
  updatedAt: write?.updatedAt ?? new Date(),
  email: write?.email ?? "fake@gmail.com",
  emailVerified: write?.emailVerified ?? true,
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

  it("will find users by their user id", async () => {
    const user = await core.userRepository.create(getFakeUser())

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
