import { InsertMark } from "../mark"
import { initMarkService } from "../mark-service"
import { v4 as uuidv4 } from "uuid"
import { initMarkRepository } from "../mark-repository"
import { NotFoundError } from "../../../errors/errors"
import { PrismaClient } from "@dotkom/db"

describe("MarkService", () => {
  const prisma = vi.mocked(PrismaClient, true)
  const markRepository = initMarkRepository(prisma)
  const markService = initMarkService(markRepository)

  it("creates a new mark", async () => {
    const mark: InsertMark = {
      title: "",
      category: "",
      details: "",
      given_to: [],
      given_at: new Date(),
      duration: 20,
    }
    const id = uuidv4()
    vi.spyOn(markRepository, "createMark").mockResolvedValueOnce({ id, ...mark })
    await expect(markService.register(mark)).resolves.toEqual({ id, ...mark })
    expect(markRepository.createMark).toHaveBeenCalledWith(mark)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(markRepository, "getMarkByID").mockResolvedValueOnce(undefined)
    await expect(markService.getMark(unknownID)).rejects.toThrow(NotFoundError)
    expect(markRepository.getMarkByID).toHaveBeenCalledWith(unknownID)
  })
})
