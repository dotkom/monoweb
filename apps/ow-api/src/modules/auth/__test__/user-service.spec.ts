import { PrismaClient } from "@dotkomonline/db"
import { v4 as uuidv4 } from "uuid"

import { NotFoundError } from "../../../errors/errors"
import { User } from "../user"
import { initUserRepository } from "../user-repository"
import { initUserService } from "../user-service"

describe("UserService", () => {
  const prisma = vi.mocked(PrismaClient.prototype, true)
  const userRepository = initUserRepository(prisma)
  const userService = initUserService(userRepository)

  it("creates a new user", async () => {
    // TODO: change this when i finish the register function
    const id = uuidv4()
    const user: User = {
      name: "Markus",
      email: "monkey@markus.com",
      id,
      image: "",
      createdAt: new Date(2022, 5, 3),
      password: "hunter2",
    }
    vi.spyOn(userRepository, "createUser").mockResolvedValueOnce(user)
    await expect(userService.register("monkey@markus.com", "password")).resolves.toEqual(user)
    expect(userRepository.createUser).toHaveBeenCalledWith(user)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(userRepository, "getUserByID").mockResolvedValueOnce(undefined)
    await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  })
})
