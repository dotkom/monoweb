import { z } from "zod"

export const InterestGroupSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string(),
  link: z.string().nullable(), //slack link
  isActive: z.boolean(),
  longDescription: z.string(),
  joinInfo: z.string(),
})

export type InterestGroup = z.infer<typeof InterestGroupSchema>
export type InterestGroupId = InterestGroup["id"]

export const InterestGroupWriteSchema = InterestGroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type InterestGroupWrite = z.infer<typeof InterestGroupWriteSchema>
