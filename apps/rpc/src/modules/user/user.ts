import type { GetUsers200ResponseOneOfInnerIdentitiesInner } from "auth0"
import { z } from "zod"

export const Auth0ConnectionSchema = z.object({
  identities: z.array(z.custom<GetUsers200ResponseOneOfInnerIdentitiesInner>()),
  hasFeide: z.boolean(),
  hasUsernamePassword: z.boolean(),
})

export type Auth0Connection = z.infer<typeof Auth0ConnectionSchema>
