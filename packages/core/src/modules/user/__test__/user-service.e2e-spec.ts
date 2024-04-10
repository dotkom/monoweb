import crypto from "node:crypto"
import { createEnvironment } from "@dotkomonline/env"
import type { UserWrite } from "@dotkomonline/types"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { type CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { type ServiceLayer, createServiceLayer } from "../../core"

const fakeUser = (subject?: string): UserWrite => ({
  auth0Sub: subject ?? crypto.randomUUID(),
  studyYear: 0,
  email: "testuser512312412@gmail.com",
  // givenName: "Test",
  // familyName: "User",
  name: "Test User",
  lastSyncedAt: new Date(),
})

describe("users", () => {
  let core: ServiceLayer
  let cleanup: CleanupFunction

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "user")
    cleanup = context.cleanup
    core = await createServiceLayer({ db: context.kysely })
  })

  afterEach(async () => {
    await cleanup()
  })

  it("can create new users", async () => {
    const none = await core.userService.getAllUsers(100)
    expect(none).toHaveLength(0)

    const user = await core.userService.createUser(fakeUser())

    const users = await core.userService.getAllUsers(100)
    expect(users).toContainEqual(user)
  })

  it("will not allow two users the same subject", async () => {
    const subject = crypto.randomUUID()
    const first = await core.userService.createUser(fakeUser(subject))
    expect(first).toBeDefined()
    await expect(core.userService.createUser(fakeUser(subject))).rejects.toThrow()
  })

  it("will find users by their user id", async () => {
    const user = await core.userService.createUser(fakeUser())

    const match = await core.userService.getById(user.id)
    expect(match).toEqual(user)
    const fail = await core.userService.getById(ulid())
    expect(fail).toBeUndefined()
  })

  it("can update users given their id", async () => {
    await expect(
      core.userService.updateUser(ulid(), {
        auth0Sub: crypto.randomUUID(),
      })
    ).rejects.toThrow()
    const user = await core.userService.createUser(fakeUser())
    const updated = await core.userService.updateUser(user.id, {
      auth0Sub: crypto.randomUUID(),
    })
    expect(updated.auth0Sub).not.toEqual(user.auth0Sub)
  })
})
