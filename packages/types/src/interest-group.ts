import { z } from "zod"

export const InterestGroupSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string(),
})

export type InterestGroup = z.infer<typeof InterestGroupSchema>
export type InterestGroupId = InterestGroup["id"]

export const InterestGroupWriteSchema = InterestGroupSchema.omit({
  id: true,
  createdAt: true,
})

export type InterestGroupWrite = z.infer<typeof InterestGroupWriteSchema>
