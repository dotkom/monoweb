import { z } from "zod"
import { Mark as PrismaMark } from "@dotkom/db"

const markSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  category: z.string(),
  details: z.string(),
  given_to: z.string().array(),
})

export type Mark = z.infer<typeof markSchema>
export type InsertMark = Omit<Mark, "id">

export const mapToMark = (payload: PrismaMark): Mark => {
  const mark: Mark = {
    ...payload,
  }
  return markSchema.parse(mark)
}
