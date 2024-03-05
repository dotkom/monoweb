import crypto from "crypto"
import { beforeEach, describe, expect, it } from "vitest"
import { ulid } from "ulid"
import { createEnvironment } from "@dotkomonline/env"
import { createKysely } from "@dotkomonline/db"
import { createServiceLayer, type ServiceLayer } from "../../core"
import { User, UserWrite } from "@dotkomonline/types"

const fakeUser = (subject?: string): UserWrite => ({
  auth0Sub: subject ?? crypto.randomUUID(),
  studyYear: 0,
  email: "",
  firstName: "Test",
  lastName: "User",
  name: "Test User",
})

describe("users", () => {
  let core: ServiceLayer

  beforeEach(async () => {
    const env = createEnvironment()
    const db = createKysely(env)
    core = await createServiceLayer({ db })
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
