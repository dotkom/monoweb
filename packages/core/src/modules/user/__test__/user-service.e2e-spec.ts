import { createEnvironment } from "@dotkomonline/env"
import type { ApiResponse, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type DeepMockProxy, mockDeep } from "vitest-mock-extended"
import { getAuth0UserMock, getUserMock } from "../../../../mock"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayerForUserTests } from "./core"

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
    const user = await core.userRepository.create(getUserMock())

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

    const insertedUser = await core.userRepository.create(fakeInsert)

    const auth0UpdateResponse = {
      data: getAuth0UserMock({ givenName: updatedGivenName, id: insertedUser.id, auth0Id: insertedUser.auth0Id }),
      status: 200,
      statusText: "OK",
    } as unknown as ApiResponse<GetUsers200ResponseOneOfInner>
    const auth0ResponsePromise = new Promise<typeof auth0UpdateResponse>((resolve) => {
      resolve(auth0UpdateResponse)
    })

    // Mock the auth0 update call
    auth0Client.users.update.mockReturnValueOnce(auth0ResponsePromise)

    const updatedUserWrite = {
      ...insertedUser,
      givenName: updatedGivenName,
    }

    const updated = await core.userService.updateUser(updatedUserWrite)

    expect(updated.givenName).toEqual(updatedGivenName)
  })
})
