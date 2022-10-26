import { InsertPersonalMark } from "../personal-mark"
import { initPersonalMarkService } from "../personal-mark-service"
import { v4 as uuidv4 } from "uuid"
import { initPersonalMarkRepository } from "../personal-mark-repository"
import { NotFoundError } from "../../../errors/errors"
import { PrismaClient } from "@dotkom/db"
import { initCalculations } from "../mark-calculations"

describe("PersonalMarkService", () => {
  const prisma = vi.mocked(PrismaClient, true)
  const personalMarkRepository = initPersonalMarkRepository(prisma, initCalculations())
  const personalMarkService = initPersonalMarkService(personalMarkRepository)

  it("creates a new personalMark", async () => {
    const personalMark: InsertPersonalMark = {
      id: "test",
      start_date: new Date(),
      end_date: new Date(),
      active_marks: ["Late feedback"],
      mark_history: ["Didn't show up to event", "Didn't pay for event in time"],
    }
    vi.spyOn(personalMarkRepository, "createPersonalMark").mockResolvedValueOnce({ ...personalMark })
    await expect(personalMarkService.register(personalMark)).resolves.toEqual({ ...personalMark })
    expect(personalMarkRepository.createPersonalMark).toHaveBeenCalledWith(personalMark)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(personalMarkRepository, "getPersonalMarkByID").mockResolvedValueOnce(undefined)
    await expect(personalMarkService.getPersonalMark(unknownID)).rejects.toThrow(NotFoundError)
    expect(personalMarkRepository.getPersonalMarkByID).toHaveBeenCalledWith(unknownID)
  })

  it("only accepts unique IDs", async () => {
    const personalMark: InsertPersonalMark = {
      id: "non-unique ID",
      start_date: null,
      end_date: null,
      active_marks: [],
      mark_history: [],
    }
    vi.spyOn(personalMarkRepository, "createPersonalMark").mockResolvedValueOnce({ ...personalMark })
    await expect(personalMarkService.register(personalMark)).resolves.toEqual({ ...personalMark })
    expect(personalMarkRepository.createPersonalMark).toHaveBeenCalledWith(personalMark)
    await expect(personalMarkService.register(personalMark)).rejects.toThrow(TypeError)
    expect(personalMarkRepository.createPersonalMark).toHaveBeenCalledWith(personalMark)
  })
})
