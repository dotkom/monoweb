import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type ListUsersCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"
import { type User, type UserId, type UserWrite, type UserIDP, UserIDPSchema } from "@dotkomonline/types"
import { type Cursor } from "../utils/db-utils"

export interface IDPRepository {
  getBySubject(cognitoSubject: string): Promise<UserIDP | undefined>
  getAll(limit: number): Promise<UserIDP[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  search(searchQuery: string, take: number, cursor?: Cursor): Promise<UserIDP[]>
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

  async create(): Promise<User> {
    throw new Error("Method not implemented.")
  }

  async update(): Promise<User> {
    throw new Error("Method not implemented.")
  }

  async getBySubject(cognitoSubject: string): Promise<UserIDP | undefined> {
    const users = await this.listUsersWithFilter(1, {
      filterAttribute: "sub",
      filterType: "exact",
      filterValue: cognitoSubject,
    })
    if (users.length !== 1) {
      return undefined
    }
    return users[0]
  }
}
