import { PrismaClient } from "@dotkom/db"
import { getLogger } from "@dotkom/logger"
import { InsertPunishment, mapToPunishment, Punishment } from "./punishment"

export interface PunishmentRepository {
  getPunishmentByID: (id: string) => Promise<Punishment | undefined>
  createPunishment: (punishmentInsert: InsertPunishment) => Promise<Punishment>
  getPunishmentByUser: (id: string) => Promise<Punishment[]>
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
    createPunishment: async (punishmentInsert) => {
      const { type, rulsetID, userID } = punishmentInsert
      const punishment = await client.punishment.create({
        data: {
          type,
          ruleset_id: rulsetID,
          user_id: userID,
        },
      })
      return mapToPunishment(punishment)
    },
    getPunishmentByUser: async (id) => {
      const punishments = await client.punishment.findMany({ where: { user_id: id } })
      return punishments.map(mapToPunishment)
    },
  }

  return repo
}
