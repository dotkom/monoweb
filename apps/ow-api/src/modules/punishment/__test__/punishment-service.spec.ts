import { mockDeep } from "jest-mock-extended"
import { Punishment } from "../punishment"
import { PunishmentRepository } from "../punishment-repository"
import { initPunishmentService } from "../punishment-service"
import { calculateEndDate } from "../tools/punishment-tools"

describe("PunishmentService", () => {
  const punishmentRepository = mockDeep<PunishmentRepository>()
  const punishmentService = initPunishmentService(punishmentRepository)

  it("can find newest punishment", async () => {
    const punishments: Punishment[] = [
      { givenDate: new Date(), id: "", rulsetID: "", startDate: new Date(2022, 12, 15), type: "MARK", userID: "" },
      { givenDate: new Date(), id: "", rulsetID: "", startDate: new Date(2021, 12, 16), type: "MARK", userID: "" },
      { givenDate: new Date(), id: "", rulsetID: "", startDate: new Date(2022, 12, 14), type: "MARK", userID: "" },
      { givenDate: new Date(), id: "", rulsetID: "", startDate: new Date(2021, 12, 12), type: "MARK", userID: "" },
    ]
    punishmentRepository.getPunishmentByUserID.mockResolvedValueOnce(punishments)
  })

  it("can get right date", async () => {
    const before_summer_date = new Date(2022, 5, 23)
    expect(calculateEndDate(before_summer_date, 20)).toEqual(new Date(2022, 8, 10))
  })

  //it("    fails on unknown id", async () => {
  //  const unknownID = uuidv4()
  //  userRepository.getUserByID.mockResolvedValueOnce(undefined)
  //  await expect(userService.getUser(unknownID)).rejects.toThrow(NotFoundError)
  //    expect(userRepository.getUserByID).toHaveBeenCalledWith(unknownID)
  //})
})
