import { z } from "zod"

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  givenAt: z.date(),
  updatedAt: z.date(),
  category: z.string(),
  details: z.string(),
  duration: z.number(),
})

export type Profile = z.infer<typeof ProfileSchema>
export type ProfileWrite = Omit<Profile, "id">
