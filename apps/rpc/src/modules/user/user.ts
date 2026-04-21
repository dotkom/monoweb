import type { GetUsers200ResponseOneOfInnerIdentitiesInner, ManagementClient } from "auth0"
import { z } from "zod"

export const Auth0ConnectionSchema = z.object({
  identities: z.array(z.custom<GetUsers200ResponseOneOfInnerIdentitiesInner>()),
  hasFeide: z.boolean(),
  hasUsernamePassword: z.boolean(),
})

export type Auth0Connection = z.infer<typeof Auth0ConnectionSchema>

export type Auth0UserProfile = Awaited<ReturnType<ManagementClient["users"]["get"]>>["data"]

export const Auth0UserProfileUserMetadataSchema = z
  .object({
    // The name a user entered when registering (since April 2026). Used for making sure we don't replace the user's
    // name with the Feide name if an admin has manually updated it.
    full_name: z.string(),
  })
  .partial()
  .passthrough()

export type Auth0UserProfileUserMetadata = z.infer<typeof Auth0UserProfileUserMetadataSchema>

// Old users from OnlineWeb 4 (previous version of the website) may have some metadata used for the migration into
// Auth0. Only the fields defined here should still be in active use.
export const Auth0UserProfileAppMetadataSchema = z
  .object({
    // The user's full name as provided by Feide. Used for replacing user-entered names.
    feide_full_name: z.string(),
    // Immutable copy of user metadata field `full_name`. Semantically, user metadata is editable by the user.
    initial_full_name: z.string(),
  })
  .partial()
  .passthrough()

export type Auth0UserProfileAppMetadata = z.infer<typeof Auth0UserProfileAppMetadataSchema>
