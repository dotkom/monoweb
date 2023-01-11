import { z } from "zod"

export const personalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
})

export type PersonalMark = z.infer<typeof personalMarkSchema>
export type InsertPersonalMark = PersonalMark
