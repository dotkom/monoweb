import { z } from "zod"
export const IDPUserSchema = z.object({
  email: z.string(),
  gender: z.string(),
  familyName: z.string(),
  givenName: z.string(),
  subject: z.string(),
})

export type IDPUser = z.infer<typeof IDPUserSchema>
