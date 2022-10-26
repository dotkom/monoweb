import { z } from "zod"
import { PersonalMarks as PrismaPersonalMarks } from "@dotkom/db"

const personalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
})

export type PersonalMarks = z.infer<typeof personalMarkSchema>
export type InsertPersonalMarks = PersonalMarks

export const mapToPersonalMarks = (payload: PrismaPersonalMarks): PersonalMarks => {
  const personalMark: PersonalMarks = {
    ...payload,
  }
  return personalMarkSchema.parse(personalMark)
}
