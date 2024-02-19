import { env } from "@dotkomonline/env"
import { type UserIDP } from "@dotkomonline/types"
import { ManagementClient } from "auth0"

export interface IDPRepository {
  getBySubject(IDPuserId: string): Promise<UserIDP | undefined>
  getAll(limit: number): Promise<UserIDP[]>
  search(searchQuery: string, take: number): Promise<UserIDP[]>
}

export class Auth0IDPRepositoryImpl implements IDPRepository {
  private readonly client: ManagementClient
  constructor() {
    this.client = new ManagementClient({
      domain: "onlineweb.eu.auth0.com",
      clientId: env.GTX_AUTH0_CLIENT_ID,
      clientSecret: env.GTX_AUTH0_CLIENT_SECRET,
    })
  }

  async getAll(limit: number): Promise<UserIDP[]> {
    const users = await this.client.users.getAll({
      per_page: limit,
    })

    return users.data.map((user) => ({
      email: user.email,
      familyName: user.family_name,
      gender: "TODO",
      givenName: user.given_name,
      subject: user.user_id,
    }))
  }

  async search(searchQuery: string, take: number): Promise<UserIDP[]> {
    const givenName = searchQuery.split(" ")[0]
    const familyName = searchQuery.split(" ")[1] || ""

    const users = await this.client.users.getAll({
      per_page: take,
      q: `given_name:${givenName}* OR family_name:${familyName}* OR family_name:${givenName}`,
    })

    return users.data.map((user) => ({
      email: user.email,
      familyName: user.family_name,
      gender: "male",
      givenName: user.given_name,
      subject: user.user_id,
    }))
  }

  async getBySubject(IDPuserId: string): Promise<UserIDP | undefined> {
    const res = await this.client.users.get({
      id: IDPuserId,
    })
    return {
      email: res.data.email,
      familyName: res.data.family_name,
      gender: "male",
      givenName: res.data.given_name,
      subject: res.data.user_id,
    }
  }
}
