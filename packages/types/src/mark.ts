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

export const MarkWriteSchema = MarkSchema.partial({
  id: true,
  givenAt: true,
  updatedAt: true,
})

export type MarkWrite = z.infer<typeof MarkWriteSchema>

export const MarkWriteOptionalDurationSchema = MarkWriteSchema.partial({
  duration: true,
})

export type MarkWriteOptionalDuration = z.infer<typeof MarkWriteOptionalDurationSchema>
