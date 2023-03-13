import { randomUUID } from "crypto"
import { Kysely } from "kysely"

import { NotFoundError } from "../../../errors/errors"
import { initUserRepository } from "../user-repository"
import { initUserService } from "../user-service"

describe("UserService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const userRepository = initUserRepository(db)
  const userService = initUserService(userRepository)

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(userRepository, "getUserByID").mockResolvedValueOnce(undefined)
    await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  })
})
