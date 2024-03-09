import { z } from "zod"

// openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
export const OidcUser = z.object({
  subject: z.string(),
  name: z.string(),
  email: z.string(),

  //TODO: We are not currently gathering these fields from our users. This is blocked by this.
  // gender: z.string(),
  // givenName: z.string(),
  // familyName: z.string(),
})

export type OidcUser = z.infer<typeof OidcUser>
