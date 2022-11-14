import { Database } from "@dotkomonline/db"
import { randomUUID } from "crypto"
import { Kysely } from "kysely"
import { v4 as uuidv4 } from "uuid"

import { NotFoundError } from "../../../errors/errors"
import { User } from "../user"
import { initUserRepository } from "../user-repository"
import { initUserService } from "../user-service"

describe("UserService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const userRepository = initUserRepository(db)
  const userService = initUserService(userRepository)

  it("creates a new user", async () => {
    // TODO: change this when i finish the register function
    const id = randomUUID()
    const user = {
      id: id,
      email: "monkey@markus.com",
      password: "password",
      createdAt: new Date("2021-01-01"),
    }
    vi.spyOn(userRepository, "createUser").mockResolvedValueOnce(user)
    const res = await userService.register(user.email, user.password)
    expect(res.email).toEqual(user.email)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(userRepository, "getUserByID").mockResolvedValueOnce(undefined)
    await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  })
})
