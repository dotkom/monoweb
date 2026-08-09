import { z } from "zod"

export const FadderukeSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  eventId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type Fadderuke = z.infer<typeof FadderukeSchema>
export type FadderukeId = Fadderuke["id"]

export const FadderukeWriteSchema = FadderukeSchema.pick({
  year: true,
  eventId: true,
})
export type FadderukeWrite = z.infer<typeof FadderukeWriteSchema>
