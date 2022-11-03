import { PrismaClient } from "@dotkomonline/db"
import { v4 as uuidv4 } from "uuid"

import { NotFoundError } from "../../../errors/errors"
import { InsertUser } from "../user"
import { initUserRepository } from "../user-repository"
import { initUserService } from "../user-service"

describe("UserService", () => {
  const prisma = vi.mocked(PrismaClient.prototype, true)
  const userRepository = initUserRepository(prisma)
  const userService = initUserService(userRepository)

  it("creates a new user", async () => {
    const user: InsertUser = {
      firstName: "Monkey",
      lastName: "Markus",
      email: "monkey@markus.com",
      username: "monkey_markus",
    }
    const id = uuidv4()
    vi.spyOn(userRepository, "createUser").mockResolvedValueOnce({ id, ...user })
    await expect(userService.register(user)).resolves.toEqual({ id, ...user })
    expect(userRepository.createUser).toHaveBeenCalledWith(user)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(userRepository, "getUserByID").mockResolvedValueOnce(undefined)
    await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  })
})
