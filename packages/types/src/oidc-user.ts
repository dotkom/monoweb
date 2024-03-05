import { z } from "zod"

// openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
export const OidcUser = z.object({
  subject: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  email: z.string(),

  //TODO: per 5th march 24, we don't have gender in auth0. This should be added when the data is migrated to auth0.
  // gender: z.string(), 
})

export type OidcUser = z.infer<typeof OidcUser>
