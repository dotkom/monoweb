import { createEnvironment } from "@dotkomonline/env"
import type { UserWrite } from "@dotkomonline/types"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import assert from "../../../../assert"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayerForUserTests } from "./core"

const getFakeUser = (write?: Partial<UserWrite>): UserWrite => ({
  studyYear: write?.studyYear ?? 1,
  name: write?.name ?? "Test User",
  lastSyncedAt: write?.lastSyncedAt ?? new Date(),
  allergies: write?.allergies ?? [],
  familyName: write?.familyName ?? "User",
  gender: write?.gender ?? "other",
  givenName: write?.givenName ?? "Test",
  phone: write?.phone ?? "",
  picture: write?.picture ?? "",
  id: write?.id ?? "auth0|test",
  email: write?.email ?? "fake@gmail.com",
})

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

    const match = await core.userService.getById(user.id)
    expect(match).toEqual(user)
    const fail = await core.userService.getById("nonexistent-id")
    expect(fail).toBeNull()
  })

  it("can update users given their id", async () => {
    const fakeInsert = getFakeUser()
    await expect(core.userService.updateUser("nonexistent-id", fakeInsert)).rejects.toThrow()

    const intialUser = getFakeUser({
      givenName: "Initial Name",
    })

    await core.userRepository.create(intialUser)

    const user = await core.userService.getById(intialUser.id)

    assert(user !== null, new Error("User not found"))

    const auth0UpdatedUserResponse = {
      data: getFakeAuth0User({ givenName: "Updated Name" }),
      status: 200,
      statusText: "OK",
    } as unknown as ApiResponse<GetUsers200ResponseOneOfInner>

    const auth0ResponsePromise = new Promise<typeof auth0UpdatedUserResponse>((resolve) => {
      resolve(auth0UpdatedUserResponse)
    })

    auth0Client.users.update.mockReturnValueOnce(auth0ResponsePromise)

    const updated = await core.userService.updateUser(intialUser.id, intialUser)

    expect(user.givenName).toEqual("Initial Name")
    expect(updated.givenName).toEqual("Updated Name")
  })
})
