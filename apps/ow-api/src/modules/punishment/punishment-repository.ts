import { PrismaClient } from "@dotkom/db"
import { InsertPunishment, mapToPunishment, Punishment } from "./punishment"

export interface PunishmentRepository {
  getPunishmentByID: (id: string) => Promise<Punishment | undefined>
  createPunishment: (punishmentInsert: InsertPunishment) => Promise<Punishment>
}

export const initPunishmentRepository = (client: PrismaClient): PunishmentRepository => {
  const repo: PunishmentRepository = {
    getPunishmentByID: async (id) => {
        const punishment = await client.punishment.findUnique({
            where: {id}
        })
        return punishment ? mapToPunishment(punishment): undefined
    },
    createPunishment: async (punishmentInsert) =>{
        const {type, start_date} = punishmentInsert
        const punishment = await client.punishment.create({
            data: {
                type,
                start_date
            },
        })
        return mapToPunishment(punishment)
    },
  }





  return repo
}
