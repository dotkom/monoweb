import { z } from "zod"

export const CommitteeSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  name: z.string(),
  description: z.string(),
  email: z.string(),
  image: z.string().nullable(),
})

export type CommitteeId = Committee["id"]
export type Committee = z.infer<typeof CommitteeSchema>

export const CommitteeWriteSchema = CommitteeSchema.partial({
  id: true,
  createdAt: true,
})

export type CommitteeWrite = z.infer<typeof CommitteeWriteSchema>
