import { User } from "@dotkomonline/types"
import { OAuth2Api } from "@ory/client"
import { randomUUID } from "crypto"
import { Kysely } from "kysely"

import { NotFoundError } from "../../../errors/errors"
import { initUserRepository } from "../user-repository"
import { initUserService } from "../user-service"
import argon2 from "argon2"

describe("UserService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const hydra = vi.mocked(OAuth2Api.prototype, true)
  const userRepository = initUserRepository(db)
  const userService = initUserService(userRepository, hydra)

  it("creates a new user", async () => {
    const id = randomUUID()
    const user: User = {
      id: id,
      email: "monkey@markus.com",
      name: "Markus",
      createdAt: new Date("2021-01-01"),
    }
    vi.spyOn(userRepository, "createUser").mockResolvedValueOnce(user)
    const { password, ...userRes } = await userService.signUp(user, "password")
    await expect(argon2.verify(password, "password")).resolves.toBe(true)
    expect(userRes).toEqual(user)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(userRepository, "getUserByID").mockResolvedValueOnce(undefined)
    await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  })
})
