import { z } from "zod"

export const CommitteeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string(),
})

export type Committee = z.infer<typeof CommitteeSchema>

export const CommitteeWriteSchema = CommitteeSchema.partial({
  id: true,
  createdAt: true,
})

export type CommitteeWrite = z.infer<typeof CommitteeWriteSchema>
