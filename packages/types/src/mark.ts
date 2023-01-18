import { z } from "zod"

export const MarkSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  givenAt: z.date(),
  updatedAt: z.date(),
  category: z.string(),
  details: z.string(),
  duration: z.number(),
})

export type Mark = z.infer<typeof MarkSchema>
export type MarkWrite = Omit<Mark, "id">
