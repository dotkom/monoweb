import { type OidcUser } from "@dotkomonline/types"
import { ManagementClient } from "auth0"

export interface Auth0Repository {
  getBySubject(sub: string): Promise<OidcUser | undefined>
}

export class Auth0RepositoryImpl implements Auth0Repository {
  constructor(private readonly client: ManagementClient) {}
  async getBySubject(sub: string): Promise<OidcUser | undefined> {
    const res = await this.client.users.get({
      id: sub,
    })
    return {
      email: res.data.email,
      familyName: res.data.family_name,
      givenName: res.data.given_name,
      subject: res.data.user_id,
    }
  }
}
