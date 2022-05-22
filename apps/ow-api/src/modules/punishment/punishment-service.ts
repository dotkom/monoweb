import { start } from "repl"
import { NotFoundError } from "../../errors/errors"
import { User } from "../auth/user"
import { InsertPunishment, Punishment, Ruleset } from "./punishment"
import { PunishmentRepository } from "./punishment-repository"
import { addDays } from "./tools/punishment-tools"

export interface PunishmentService {
  getPunishment: (id: Punishment["id"]) => Promise<Punishment>
  getPunishmentRuleset: (id: Punishment["id"]) => Promise<Ruleset>
  registerPunishment: (payload: InsertPunishment) => Promise<Punishment>
  getRuleset: (id: Ruleset["id"]) => Promise<Ruleset>
  getUserPunishments: (id: User["id"]) => Promise<Punishment[]>
  fixUserPunishmentsDate: (id: User["id"]) => Promise<Punishment[]>
  changePunishmentDate: (id: Punishment["id"], date: Punishment["startDate"]) => Promise<Punishment>
}

export const initPunishmentService = (punishmentRepository: PunishmentRepository): PunishmentService => {
  const service: PunishmentService = {
    /**
     * Get a punishment
     *
     * @param  {uuid} id punishment ID
     * @return {Punishment} A punishment
     */
    getPunishment: async (id) => {
      const punishment = await punishmentRepository.getPunishmentByID(id)
      if (!punishment) throw new NotFoundError(`Punishment with ID:${id} not found`)
      return punishment
    },

    /**
     * Get a punishments ruleset
     *
     * @param  {string} id punishments ID
     * @return {Ruleset} a ruleset
     */
    getPunishmentRuleset: async (id: string) => {
      const punishment = await service.getPunishment(id)
      const ruleset = await punishmentRepository.getRulesetByID(punishment.rulsetID)
      if (!ruleset) throw new NotFoundError(`Ruleset with ID:${id} not found`)
      return ruleset
    },

    /**
     * Get ruleset
     *
     * @param  {string} id ruleset ID
     * @return {Ruleset} a ruleset
     */
    getRuleset: async (id: string) => {
      const ruleset = await punishmentRepository.getRulesetByID(id)
      if (!ruleset) throw new NotFoundError(`Ruleset with ID:${id} not found`)
      return ruleset
    },

    /**
     * Create a punishment
     *
     * @param  {InsertPunishment} payload
     * @return {Punishment} the created punishment
     */
    registerPunishment: async (payload) => {
      //find all other punishments for the user
      const userPunishments = await service.getUserPunishments(payload.userID)
      let startDate = payload.givenDate

      //check if the user has more punishments
      if (userPunishments.length > 0) {
        //find the punishment that has the latest start date
        const punishmentWithLatestStartDate = userPunishments.reduce(function (prev, current) {
          return prev.startDate > current.startDate ? prev : current
        })
        //find the ruleset for the punishment with the latest start date
        const newestRuleset = await service.getRuleset(punishmentWithLatestStartDate.rulsetID)
        //find the end date of the last punishment : also possible start date for the new punishment
        let newStartDate = addDays(punishmentWithLatestStartDate.startDate, newestRuleset.duration)

        //check if the end date of the last punishment is after the given date of the new punishment
        if (newStartDate > payload.givenDate) {
          //change the start date of the new punishment to when the last punishment ends
          startDate = newStartDate
        }
      }
      const punishment = await punishmentRepository.createPunishment(payload, startDate, startDate)
      return punishment
    },

    /**
     * Changes the start date of a punishment
     *
     * @param  {uuid} id punishment ID
     * @param  {Date} date
     * @return {Punishment} the updated punishment
     */
    changePunishmentDate: async (id, date) => {
      const punishment = await punishmentRepository.updatePunishmentDate(id, date)
      if (!punishment) throw new NotFoundError(`Punishment with ID ${id} not found`)
      return punishment
    },
    /**
     * Fix the start date of punishments for a specific user
     *
     * @param  {uuid} id user ID
     * @return {Punishment[]} updated user punishments
     */
    fixUserPunishmentsDate: async (id) => {
      const userPunishments = await service.getUserPunishments(id)
      //smallest possible javascript date
      let lastPunishmentEndDate = new Date(-8640000000000000)

      userPunishments.map(async (punishment) => {
        //end date for last punishment
        //check if end date for last punishment is further into the future than the start date of the current punishment.

        const ruleset = await service.getRuleset(punishment.rulsetID)

        if (lastPunishmentEndDate >= punishment.givenDate) {
          //if so change date of the current punishment
          service.changePunishmentDate(punishment.id, lastPunishmentEndDate)
          lastPunishmentEndDate = addDays(lastPunishmentEndDate, ruleset.duration)
        } else {
          //
          service.changePunishmentDate(punishment.id, punishment.givenDate)
          lastPunishmentEndDate = addDays(punishment.givenDate, ruleset.duration)
        }
      })
      return userPunishments
    },
    /**
     * Get users punishment
     *
     * @param  {uuid} id user ID
     * @return {Punishment[]} array of users punishments
     */
    getUserPunishments: async (id) => {
      const punishments = await punishmentRepository.getPunishmentByUserID(id)
      return punishments
    },
  }
  return service
}
