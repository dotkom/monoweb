import { Database } from "@dotkomonline/db"
import { createEnvironment } from "@dotkomonline/env"
import { UserWrite } from "@dotkomonline/types"
import crypto from "crypto"
import { Kysely } from "kysely"
import { ulid } from "ulid"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getTestDb, setupTestDB } from "../../../../vitest-integration.setup"
import { createServiceLayer, type ServiceLayer } from "../../core"

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
  let db: Kysely<Database>
  const dbName = "user"

  beforeEach(async () => {
    const env = createEnvironment()
    await setupTestDB(env, dbName)

    db = getTestDb(env, dbName)

    core = await createServiceLayer({ db })
  })

  afterEach(async () => {
    await db.destroy()
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

    const match = await core.userService.getUserById(user.id)
    expect(match).toEqual(user)
    const fail = await core.userService.getUserById(ulid())
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
