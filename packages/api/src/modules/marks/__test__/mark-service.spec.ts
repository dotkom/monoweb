import { v4 as uuidv4 } from "uuid"
import { Kysely } from "kysely"

import { NotFoundError } from "../../../errors/errors"
import { InsertMark } from "@dotkomonline/types/src/mark"
import { initMarkRepository } from "../mark-repository"
import { initMarkService } from "../mark-service"
import { initPersonalMarkRepository } from "../personal-mark-repository"

describe("MarkService", () => {
  const prisma = vi.mocked(Kysely.prototype, true)

  const personalMarkRepository = initPersonalMarkRepository(prisma)
  const markRepository = initMarkRepository(prisma)
  const markService = initMarkService(markRepository, personalMarkRepository)

  it("creates a new mark", async () => {
    const mark: InsertMark = {
      title: "",
      category: "",
      details: "",
      givenTo: [],
      givenAt: new Date(),
      duration: 20,
    }
    const id = uuidv4()
    vi.spyOn(markRepository, "createMark").mockResolvedValueOnce({ id, ...mark })
    await expect(markService.createMark(mark)).resolves.toEqual({ id, ...mark })
    expect(markRepository.createMark).toHaveBeenCalledWith(mark)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(markRepository, "getMarkByID").mockResolvedValueOnce(undefined)
    await expect(markService.getMark(unknownID)).rejects.toThrow(NotFoundError)
    expect(markRepository.getMarkByID).toHaveBeenCalledWith(unknownID)
  })
})
