import { OidcUser } from "@dotkomonline/types"
import { ManagementApiError, ManagementClient } from "auth0"

export interface Auth0Repository {
  getBySubject(sub: string): Promise<OidcUser | null>
}

export const mapToOidcUser = (payload: unknown) => OidcUser.parse(payload)

export class Auth0RepositoryImpl implements Auth0Repository {
  constructor(private readonly client: ManagementClient) {}
  async getBySubject(sub: string) {
    try {
      const user = await this.client.users.get({
        id: sub,
      })

      return mapToOidcUser(user)
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
