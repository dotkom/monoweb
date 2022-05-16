import { NotFoundError } from "@/errors/errors";
import { InsertPunishment, Punishment } from "./punishment";
import { PunishmentRepository} from "./punishment-repository";

export interface PunishmentService{
    getPunishment: (id: Punishment["id"]) => Promise<Punishment>
    registerPunishment: (payload: InsertPunishment) => Promise<Punishment>
}

export const initPunishmentService = (punishmentRepository: PunishmentRepository): PunishmentService => ({
    getPunishment: async (id) => {
        const punishment = await punishmentRepository.getPunishmentByID(id)
        if (!punishment) throw new NotFoundError(`Punishment with ID:${id} not found`)
        return punishment
    },

    registerPunishment: async (payload) => {
        const punishment = await punishmentRepository.createPunishment(payload)
        return punishment
    },

})