import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"
import { MarkNotFoundError } from "../mark-error"
import { MarkRepositoryImpl } from "../mark-repository"
import { MarkServiceImpl } from "../mark-service"

describe("MarkService", () => {
  const db = vi.mocked(PrismaClient.prototype, true)
  const markRepository = new MarkRepositoryImpl(db)
  const markService = new MarkServiceImpl(markRepository)

  it("creates a new mark", async () => {
    const mark = {
      title: "",
      category: "",
      details: "",
      createdAt: new Date(),
      duration: 20,
      updatedAt: new Date(),
    }
    const id = randomUUID()
    vi.spyOn(markRepository, "create").mockResolvedValueOnce({ id, ...mark })
    await expect(markService.createMark(mark)).resolves.toEqual({ id, ...mark })
    expect(markRepository.create).toHaveBeenCalledWith(mark)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(markRepository, "getById").mockResolvedValueOnce(null)
    await expect(markService.getMark(unknownID)).rejects.toThrow(MarkNotFoundError)
    expect(markRepository.getById).toHaveBeenCalledWith(unknownID)
  })
})
