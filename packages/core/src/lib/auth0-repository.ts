import { type OidcUser } from "@dotkomonline/types"
import { ManagementClient } from "auth0"

export interface Auth0Repository {
  getBySubject(sub: string): Promise<OidcUser | undefined>
  getAll(limit: number): Promise<OidcUser[]>
  searchByFullName(query: string, take: number): Promise<OidcUser[]>
}

export class Auth0IDPRepositoryImpl implements Auth0Repository {
  constructor(private readonly client: ManagementClient) {}

  async getAll(limit: number): Promise<OidcUser[]> {
    const users = await this.client.users.getAll({
      per_page: limit,
    })

    return users.data.map((user) => ({
      email: user.email,
      familyName: user.family_name,
      givenName: user.given_name,
      subject: user.user_id,
    }))
  }

  async searchByFullName(query: string, take: number): Promise<OidcUser[]> {
    const givenName = query.split(" ")[0]
    const familyName = query.split(" ")[1] || ""

    const users = await this.client.users.getAll({
      per_page: take,
      q: `given_name:${givenName}* OR family_name:${familyName}* OR family_name:${givenName}`,
    })

    return users.data.map((user) => ({
      email: user.email,
      familyName: user.family_name,
      givenName: user.given_name,
      subject: user.user_id,
    }))
  }

  async getBySubject(IDPuserId: string): Promise<OidcUser | undefined> {
    const res = await this.client.users.get({
      id: IDPuserId,
    })
    return {
      email: res.data.email,
      familyName: res.data.family_name,
      givenName: res.data.given_name,
      subject: res.data.user_id,
    }
  }
}
