import { z } from "zod"
import { Punishment as PrismaPunishment } from "@dotkom/db"
import { PunishmentType } from "@dotkom/db"

const punishmentSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(PunishmentType),
  start_date: z.date(),
})

export type Punishment = z.infer<typeof punishmentSchema>
export type InsertPunishment = Omit<Punishment, "id">

export const mapToPunishment = (payload: PrismaPunishment): Punishment => {  
  return punishmentSchema.parse(payload)
}
