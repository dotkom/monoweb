import { z } from "zod"
import { PersonalMark as PrismaPersonalMark } from "@dotkom/db"

const personalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
})

export type PersonalMark = z.infer<typeof personalMarkSchema>
export type InsertPersonalMark = PersonalMark

export const mapToPersonalMark = (payload: PrismaPersonalMark): PersonalMark => {
  const personalMark: PersonalMark = {
    ...payload,
  }
  return personalMarkSchema.parse(personalMark)
}
