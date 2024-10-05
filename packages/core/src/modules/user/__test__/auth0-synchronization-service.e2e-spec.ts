import type { ManagementClient } from "auth0"
import { addHours } from "date-fns"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { DeepMockProxy } from "vitest-mock-extended"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { mockAuth0UserResponse } from "../../../mock"
import type { ServiceLayer } from "../../core"

describe("auth0 sync service", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction
  let auth0Client: DeepMockProxy<ManagementClient>

  beforeEach(async () => {
    const context = await createServiceLayerForTesting("job-listing")
    core = context.core
    cleanup = context.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("verifies synchronization works", async () => {
    const auth0Id = "auth0|00000000-0000-0000-0000-000000000000"
    const email = "starting-email@local.com"
    const now = new Date("2021-01-01T00:00:00Z")

    const updatedWithFakeDataUser = mockAuth0UserResponse({ email, auth0Id }, 200)
    auth0Client.users.get.mockResolvedValue(updatedWithFakeDataUser)

    // first sync down to the local db. Should create user row in the db and populate with fake data.
    const syncedUser = await core.auth0SynchronizationService.ensureUserLocalDbIsSynced(auth0Id, now)

    const dbUser = await core.userService.getById(syncedUser.id)
    expect(dbUser).toEqual(syncedUser)

    // Simulate an email change in the Auth0 dashboard or something.
    const updatedMail = "changed-in-dashboard@local.com"
    auth0Client.users.get.mockResolvedValue(mockAuth0UserResponse({ email: updatedMail }, 200))

    // Run synchroinization again, simulating doing it 1hr later. However, since the user was just synced, the synchronization should not occur.
    const oneHourLater = addHours(now, 1)
    const updatedDbUser = await core.auth0SynchronizationService.ensureUserLocalDbIsSynced(auth0Id, oneHourLater)
    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)

    // Attempt to sync the user again 25 hours after first sync. This time, the synchronization should occur.
    const twentyFiveHoursLater = addHours(now, 25)
    await core.auth0SynchronizationService.ensureUserLocalDbIsSynced(auth0Id, twentyFiveHoursLater)

    expect(updatedDbUser).not.toHaveProperty("email", updatedMail)
  })
})
