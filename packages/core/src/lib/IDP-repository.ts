import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type ListUsersCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"
import { env } from "@dotkomonline/env"
import { UserIDPSchema, type UserIDP } from "@dotkomonline/types"
import { ManagementClient } from "auth0"

export interface IDPRepository {
  getBySubject(IDPuserId: string): Promise<UserIDP | undefined>
  getAll(limit: number): Promise<UserIDP[]>
  search(searchQuery: string, take: number): Promise<UserIDP[]>
}

export class CognitoIDPRepositoryImpl implements IDPRepository {
  private readonly client: CognitoIdentityProviderClient
  constructor() {
    this.client = new CognitoIdentityProviderClient({ region: "eu-north-1" })
  }

  private async listUsersWithFilter(
    limit: number,
    filter?: {
      filterType: "exact" | "prefix"
      filterAttribute: string
      filterValue: string
    }
  ): Promise<UserIDP[]> {
    const constructFilter = (att: string, filtertype: "exact" | "prefix", val: string) =>
      `${att} ${filtertype === "exact" ? "=" : "^="} "${val}"`

    const commandConfig: ListUsersCommandInput = {
      UserPoolId: "eu-north-1_wnSVVBSoo",
      Limit: limit,
    }

    const { filterType, filterAttribute, filterValue } = filter || {}

    if (filterAttribute && filterValue && filterType) {
      const filter = constructFilter(filterAttribute, filterType, filterValue)
      commandConfig["Filter"] = filter
    }

    const command = new ListUsersCommand(commandConfig)

    const data = await this.client.send(command)

    if (!data.Users) {
      return []
    }

    return data.Users.map((user) => {
      const userData = {
        email: user.Attributes?.find((attr) => attr.Name === "email")?.Value,
        gender: user.Attributes?.find((attr) => attr.Name === "gender")?.Value,
        familyName: user.Attributes?.find((attr) => attr.Name === "family_name")?.Value,
        givenName: user.Attributes?.find((attr) => attr.Name === "given_name")?.Value,
        subject: user.Attributes?.find((attr) => attr.Name === "sub")?.Value,
      }

      const parsed = UserIDPSchema.safeParse(userData)

      if (parsed.success === false) {
        console.error("Failed to parse UserIDP", user.Attributes)
        return null
      }
      return parsed.data
    }).filter((user) => user !== null) as UserIDP[]
  }

  async getAll(limit: number): Promise<UserIDP[]> {
    return this.listUsersWithFilter(limit)
  }

  async search(searchQuery: string, take: number): Promise<UserIDP[]> {
    const users = await this.listUsersWithFilter(take, {
      filterAttribute: "given_name",
      filterType: "prefix",
      filterValue: searchQuery,
    })
    return users
  }

  async getBySubject(IDPuserId: string): Promise<UserIDP | undefined> {
    const users = await this.listUsersWithFilter(1, {
      filterAttribute: "sub",
      filterType: "exact",
      filterValue: IDPuserId,
    })
    if (users.length !== 1) {
      return undefined
    }
    return users[0]
  }
}

export class Auth0IDPRepositoryImpl implements IDPRepository {
  private readonly client: ManagementClient
  constructor() {
    this.client = new ManagementClient({
      domain: "onlineweb.eu.auth0.com",
      clientId: env.AUTH0_MANAGEMENT_API_CLIENT_ID,
      clientSecret: env.AUTH0_MANAGEMENT_API_CLIENT_SECRET,
    })
  }

  async getAll(limit: number): Promise<UserIDP[]> {
    const users = await this.client.users.getAll({
      per_page: limit,
    })

    return users.data.map((user) => ({
      email: user.email,
      familyName: user.family_name,
      gender: "male",
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

    console.dir(users)

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
