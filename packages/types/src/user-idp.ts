import { z } from "zod"
export const UserIDPSchema = z.object({
  email: z.string(),
  gender: z.string(),
  familyName: z.string(),
  givenName: z.string(),
  subject: z.string(),
})

export type UserIDP = z.infer<typeof UserIDPSchema>
