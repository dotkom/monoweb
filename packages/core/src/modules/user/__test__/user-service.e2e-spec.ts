import type { ManagementClient } from "auth0"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { DeepMockProxy } from "vitest-mock-extended"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { getUserMock, mockAuth0UserResponse } from "../../../mock"
import type { ServiceLayer } from "../../core"

describe("users", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction
  let auth0Client: DeepMockProxy<ManagementClient>

  beforeEach(async () => {
    const context = await createServiceLayerForTesting("user")
    cleanup = context.cleanup
    auth0Client = context.auth0Client
    core = context.core
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

    const auth0ResponsePromise = Promise.resolve(auth0UpdateResponse)

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
