import { z } from "zod"

export const MarkSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  givenAt: z.date(),
  category: z.string(),
  details: z.string(),
  givenTo: z.string().array(),
  duration: z.number(),
})

export type Mark = z.infer<typeof MarkSchema>
export type InsertMark = Omit<Mark, "id">
