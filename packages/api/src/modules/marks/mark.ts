import { Database } from "@dotkomonline/db"
import { Selectable } from "kysely"
import { z } from "zod"

const markSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  givenAt: z.date(),
  category: z.string(),
  details: z.string(),
  givenTo: z.string().array(),
  duration: z.number(),
})

export type Mark = z.infer<typeof markSchema>
export type InsertMark = Omit<Mark, "id">

export const mapToMark = (payload: Selectable<Database["mark"]>): Mark => {
  return markSchema.parse(payload)
}
