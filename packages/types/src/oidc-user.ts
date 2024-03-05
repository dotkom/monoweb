import { z } from "zod"
export const OidcUser = z.object({
  email: z.string(),
  gender: z.string(),
  familyName: z.string(),
  givenName: z.string(),
  subject: z.string(),
})

export type OidcUser = z.infer<typeof OidcUser>
