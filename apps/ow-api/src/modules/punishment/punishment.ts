import { z } from "zod"
import { Punishment as PrismaPunishment } from "@dotkom/db"
import { PunishmentType } from "@dotkom/db"

const punishmentSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(PunishmentType),
  startDate: z.date(),
  rulsetID: z.string().uuid(),
  userID: z.string().uuid(),
})

export type Punishment = z.infer<typeof punishmentSchema>
export type InsertPunishment = Omit<Punishment, "id">

export const mapToPunishment = (payload: PrismaPunishment): Punishment => {
  const punishment: Punishment = {
    ...payload,
    rulsetID: payload.ruleset_id,
    startDate: payload.start_date,
    userID: payload.user_id,
  }
  return punishmentSchema.parse(punishment)
}
