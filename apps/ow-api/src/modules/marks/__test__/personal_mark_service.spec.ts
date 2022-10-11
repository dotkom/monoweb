import { InsertPersonalMarks } from "../personal-marks"
import { initPersonalMarksService } from "../personal-marks-service"
import { v4 as uuidv4 } from "uuid"
import { initPersonalMarksRepository } from "../personal-marks-repository"
import { NotFoundError } from "../../../errors/errors"
import { PrismaClient } from "@dotkom/db"
import { initCalculations } from "../mark-calculations"

describe("PersonalMarkService", () => {
  const prisma = vi.mocked(PrismaClient, true)
  const personalMarkRepository = initPersonalMarksRepository(prisma, initCalculations())
  const personalMarkService = initPersonalMarksService(personalMarkRepository)

  it("creates a new personalMark", async () => {
    const personalMark: InsertPersonalMarks = {
      start_date: new Date(),
      end_date: new Date(),
      active_marks: ["Late feedback"],
      mark_history: ["Didn't show up to event", "Didn't pay for event in time"],
    }
    const id = uuidv4()
    vi.spyOn(personalMarkRepository, "createPersonalMarks").mockResolvedValueOnce({ id, ...personalMark })
    await expect(personalMarkService.register(personalMark)).resolves.toEqual({ id, ...personalMark })
    expect(personalMarkRepository.createPersonalMarks).toHaveBeenCalledWith(personalMark)
  })

  it("fails on unknown id", async () => {
    const unknownID = uuidv4()
    vi.spyOn(personalMarkRepository, "getPersonalMarksByID").mockResolvedValueOnce(undefined)
    await expect(personalMarkService.getPersonalMarks(unknownID)).rejects.toThrow(NotFoundError)
    expect(personalMarkRepository.getPersonalMarksByID).toHaveBeenCalledWith(unknownID)
  })
})
