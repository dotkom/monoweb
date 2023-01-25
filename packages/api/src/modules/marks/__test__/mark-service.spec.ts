import { randomUUID } from "crypto"
import { Kysely } from "kysely"

import { NotFoundError } from "../../../errors/errors"
import { MarkWrite } from "@dotkomonline/types"
import { initMarkRepository } from "../mark-repository"
import { initMarkService } from "../mark-service"

describe("MarkService", () => {
  const db = vi.mocked(Kysely.prototype, true)
  const markRepository = initMarkRepository(db)
  const markService = initMarkService(markRepository)

  it("creates a new mark", async () => {
    const mark: MarkWrite = {
      title: "",
      category: "",
      details: "",
      givenAt: new Date(),
      duration: 20,
      updatedAt: new Date(),
    }
    const id = randomUUID()
    vi.spyOn(markRepository, "createMark").mockResolvedValueOnce({ id, ...mark })
    await expect(markService.createMark(mark)).resolves.toEqual({ id, ...mark })
    expect(markRepository.createMark).toHaveBeenCalledWith(mark)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(markRepository, "getMarkByID").mockResolvedValueOnce(undefined)
    await expect(markService.getMark(unknownID)).rejects.toThrow(NotFoundError)
    expect(markRepository.getMarkByID).toHaveBeenCalledWith(unknownID)
  })
})
