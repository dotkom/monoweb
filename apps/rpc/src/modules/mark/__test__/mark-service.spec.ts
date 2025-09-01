import { randomUUID } from "node:crypto"
import { PrismaClient } from "@prisma/client"
import { MarkNotFoundError } from "../mark-error"
import { getMarkRepository } from "../mark-repository"
import { getMarkService } from "../mark-service"

describe("MarkService", () => {
  const db = vi.mocked(PrismaClient.prototype, true)
  const markRepository = getMarkRepository()
  const markService = getMarkService(markRepository)

  it("creates a new mark", async () => {
    const mark = {
      title: "",
      details: "",
      createdAt: new Date(),
      duration: 20,
      updatedAt: new Date(),
      weight: 3,
      type: "MANUAL" as const,
      groups: [],
    }
    const id = randomUUID()
    vi.spyOn(markRepository, "create").mockResolvedValueOnce({ id, ...mark })
    await expect(markService.createMark(db, mark, [])).resolves.toEqual({ id, ...mark })
    expect(markRepository.create).toHaveBeenCalledWith(db, mark)
  })

  it("fails on unknown id", async () => {
    const unknownID = randomUUID()
    vi.spyOn(markRepository, "getById").mockResolvedValueOnce(null)
    await expect(markService.getMark(db, unknownID)).rejects.toThrow(MarkNotFoundError)
    expect(markRepository.getById).toHaveBeenCalledWith(db, unknownID)
  })
})
