import { Database } from "@dotkomonline/db"
import { Selectable } from "kysely"
import { z } from "zod"

const personalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
})

export type PersonalMark = z.infer<typeof personalMarkSchema>
export type InsertPersonalMark = PersonalMark

export const mapToPersonalMark = (payload: Selectable<Database["PersonalMark"]>): PersonalMark => {
  return personalMarkSchema.parse(payload)
}
