import { PrismaClient } from "@dotkom/db"
import { getLogger } from "@dotkom/logger"
import { InsertPunishment, mapToPunishment, mapToRuleset, Punishment, Ruleset } from "./punishment"

export interface PunishmentRepository {
  getPunishmentByID: (id: string) => Promise<Punishment | undefined>
  createPunishment: (punishmentInsert: InsertPunishment, date: Date) => Promise<Punishment>
  getPunishmentByUserID: (id: string) => Promise<Punishment[]>
  getRulesetByID: (id: string) => Promise<Ruleset | undefined>
}

export const initPunishmentRepository = (client: PrismaClient): PunishmentRepository => {
  const repo: PunishmentRepository = {
    getPunishmentByID: async (id) => {
      const punishment = await client.punishment.findUnique({
        where: { id },
      })
      getLogger("").info(punishment?.start_date)
      return punishment ? mapToPunishment(punishment) : undefined
    },
    createPunishment: async (punishmentInsert, date) => {
      const { type, rulsetID, userID } = punishmentInsert
      const punishment = await client.punishment.create({
        data: {
          type: type,
          ruleset_id: rulsetID,
          user_id: userID,
          start_date: date,
        },
      })
      return mapToPunishment(punishment)
    },
    getPunishmentByUserID: async (id) => {
      const punishments = await client.punishment.findMany({ where: { user_id: id }, orderBy: { start_date: "asc" } })
      return punishments.map(mapToPunishment)
    },
    getRulesetByID: async (id) => {
      const ruleset = await client.punishmentRuleSet.findUnique({ where: { id: id } })
      return ruleset ? mapToRuleset(ruleset) : undefined
    },
  }

  return repo
}
