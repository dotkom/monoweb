import { OidcUser } from "@dotkomonline/types"
import { ManagementApiError, ManagementClient } from "auth0"

export interface Auth0Repository {
  getBySubject(sub: string): Promise<OidcUser | null>
}

export class Auth0RepositoryImpl implements Auth0Repository {
  constructor(private readonly client: ManagementClient) {}
  async getBySubject(sub: string) {
    try {
      const res = await this.client.users.get({
        id: sub,
      })

      const parsed = OidcUser.parse({
        email: res.data.email,
        subject: res.data.user_id,
        name: res.data.name,
        // familyName: res.data.family_name,
        // givenName: res.data.given_name,
      })

      return parsed
    } catch (e) {
      if (e instanceof ManagementApiError) {
        if (e.errorCode === "inexistent_user") {
          return null
        }
      }

      // Error was caused by other reasons than user not existing
      throw e
    }
  }
}
