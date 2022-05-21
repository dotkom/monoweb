import { getLogger } from "@dotkom/logger"
import { NotFoundError } from "../../errors/errors"
import { User } from "../auth/user"
import { InsertPunishment, Punishment, Ruleset } from "./punishment"
import { PunishmentRepository } from "./punishment-repository"

export interface PunishmentService {
  getPunishment: (id: Punishment["id"]) => Promise<Punishment>
  getPunishmentRuleset: (id: Punishment["id"]) => Promise<Ruleset>
  registerPunishment: (payload: InsertPunishment) => Promise<Punishment>
  getRuleset: (id: Ruleset["id"]) => Promise<Ruleset>
  getUserPunishments: (id: User["id"]) => Promise<Punishment[]>
}

export const initPunishmentService = (punishmentRepository: PunishmentRepository): PunishmentService => {
  const service: PunishmentService = {
    getPunishment: async (id) => {
      const punishment = await punishmentRepository.getPunishmentByID(id)
      if (!punishment) throw new NotFoundError(`Punishment with ID:${id} not found`)
      return punishment
    },

    getPunishmentRuleset: async (id: string) => {
      const punishment = await service.getPunishment(id)
      const ruleset = await punishmentRepository.getRulesetByID(punishment.rulsetID)
      if (!ruleset) throw new NotFoundError(`Ruleset with ID:${id} not found`)
      return ruleset
    },

    getRuleset: async (id: string) => {
      const ruleset = await punishmentRepository.getRulesetByID(id)
      if (!ruleset) throw new NotFoundError(`Ruleset with ID:${id} not found`)
      return ruleset
    },

    registerPunishment: async (payload) => {
      const userPunishments = await service.getUserPunishments(payload.userID)
      let startDate = payload.givenDate

      //find punishment with latast startDate
      if (userPunishments.length > 0) {
        const punishmentWithLatestStartDate = userPunishments.reduce(function (prev, current) {
          return prev.startDate > current.startDate ? prev : current
        })
        //find when the last punishment finishes
        const newestRuleset = await service.getRuleset(punishmentWithLatestStartDate.rulsetID)
        let newStartDate = addDays(punishmentWithLatestStartDate.startDate, newestRuleset.duration)

        //check if the latest punishment ends before the given date of the new punishment
        if (newStartDate > payload.givenDate) {
          startDate = newStartDate
        }
      }
      const punishment = await punishmentRepository.createPunishment(payload, startDate)
      return punishment
    },

    getUserPunishments: async (id) => {
      const punishments = await punishmentRepository.getPunishmentByUserID(id)
      return punishments
    },
  }
  return service
}

function addDays(date: Date, days: number) {
  var result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
