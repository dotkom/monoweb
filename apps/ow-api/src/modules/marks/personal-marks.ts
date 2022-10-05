import { z } from "zod"
import { PersonalMarks as PrismaPersonalMarks } from "@dotkom/db"

const personalMarkSchema = z.object({
  id: z.string().uuid(),
  start_date: z.date(),
  end_date: z.date(),
  active_marks: z.string().array(),
  mark_history: z.string().array(),
})

export type PersonalMarks = z.infer<typeof personalMarkSchema>
export type InsertPersonalMarks = Omit<PersonalMarks, "id">

export const mapToPersonalMarks = (payload: PrismaPersonalMarks): PersonalMarks => {
  const personalMark: PersonalMarks = {
    ...payload,
  }
  return personalMarkSchema.parse(personalMark)
}
