import { z } from "zod"
import { PersonalMarks as PrismaPersonalMarks } from "@dotkom/db"

const personalMarkSchema = z.object({
  userId: z.string().uuid(),
  start_date: z.date().nullable().default(null),
  end_date: z.date().nullable().default(null),
  active_marks: z.string().array().default([]),
  mark_history: z.string().array().default([]),
})

export type PersonalMarks = z.infer<typeof personalMarkSchema>
export type InsertPersonalMarks = PersonalMarks

export const mapToPersonalMarks = (payload: PrismaPersonalMarks): PersonalMarks => {
  const personalMark: PersonalMarks = {
    ...payload,
  }
  return personalMarkSchema.parse(personalMark)
}
