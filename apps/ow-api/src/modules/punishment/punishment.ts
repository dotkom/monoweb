import { z } from "zod"
import { Punishment as PrismaPunishment, PunishmentRuleSet as PrsimaPunishmentRuleset } from "@dotkom/db"
import { PunishmentType } from "@dotkom/db"

export const punishmentSchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(PunishmentType),
  startDate: z.date(),
  rulsetID: z.string().uuid(),
  userID: z.string().uuid(),
  givenDate: z.date(),
})

export const rulesetSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  duration: z.number(),
  description: z.string(),
})

export type Punishment = z.infer<typeof punishmentSchema>
export type InsertPunishment = Omit<Omit<Punishment, "id">, "startDate">

export type Ruleset = z.infer<typeof rulesetSchema>
export type InsertRuleset = Omit<Ruleset, "id">

export const mapToPunishment = (payload: PrismaPunishment): Punishment => {
  const punishment: Punishment = {
    ...payload,
    rulsetID: payload.ruleset_id,
    startDate: payload.start_date,
    userID: payload.user_id,
    givenDate: payload.given_date,
  }
  return punishmentSchema.parse(punishment)
}

export const mapToRuleset = (payload: PrsimaPunishmentRuleset): Ruleset => {
  const ruleset: Ruleset = {
    ...payload,
  }
  return rulesetSchema.parse(ruleset)
}
