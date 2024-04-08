import { OidcUser } from "@dotkomonline/types"
import { ManagementApiError, type ManagementClient } from "auth0"

export interface Auth0Repository {
  getBySubject(sub: string): Promise<OidcUser | null>
}

interface Payload {
  subject: string
  name: string
  email: string
}
export const mapToOidcUser = (payload: Payload) => OidcUser.parse(payload)

export class Auth0RepositoryImpl implements Auth0Repository {
  constructor(private readonly client: ManagementClient) {}
  async getBySubject(sub: string) {
    try {
      const user = await this.client.users.get({
        id: sub,
      })

      return mapToOidcUser({
        subject: user.data.user_id,
        name: user.data.name,
        email: user.data.email,
      })
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
