import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  type ListUsersCommandInput,
} from "@aws-sdk/client-cognito-identity-provider"
import { type User, type UserId, type UserWrite } from "@dotkomonline/types"
import { z } from "zod"
import { type Cursor } from "../utils/db-utils"

interface IDPRepository {
  getBySubject(cognitoSubject: string): Promise<IDPUser | undefined>
  getAll(limit: number): Promise<IDPUser[]>
  create(userWrite: UserWrite): Promise<User>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  search(searchQuery: string, take: number, cursor?: Cursor): Promise<User[]>
}

const IDPUserSchema = z.object({
  email: z.string(),
  gender: z.string(),
  familyName: z.string(),
  givenName: z.string(),
  subject: z.string(),
})

type IDPUser = z.infer<typeof IDPUserSchema>

export class CognitoIDPRepositoryImpl implements IDPRepository {
  private readonly client: CognitoIdentityProviderClient
  constructor() {
    this.client = new CognitoIdentityProviderClient({ region: "eu-north-1" })
  }

  private async listUsersWithFilter(limit: number, filterAttribute?: string, filterValue?: string): Promise<IDPUser[]> {
    const constructFilter = (att: string, val: string) => `${att} = "${val}"`
    const commandConfig: ListUsersCommandInput = {
      UserPoolId: "eu-north-1_wnSVVBSoo",
      Limit: limit,
    }

    if (filterAttribute && filterValue) {
      const filter = constructFilter(filterAttribute, filterValue)
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

      const parsed = IDPUserSchema.safeParse(userData)

      if (parsed.success === false) {
        console.error("Failed to parse IDPUser", user.Attributes)
        return null
      }
      return parsed.data
    }).filter((user) => user !== null) as IDPUser[]
  }

  async getAll(limit: number): Promise<IDPUser[]> {
    return this.listUsersWithFilter(limit)
  }

  async create(userWrite: UserWrite): Promise<User> {
    throw new Error("Method not implemented.")
  }

  async update(id: UserId, data: Partial<UserWrite>): Promise<User> {
    throw new Error("Method not implemented.")
  }

  async getBySubject(cognitoSubject: string): Promise<IDPUser | undefined> {
    const users = await this.listUsersWithFilter(1, "sub", cognitoSubject)
    if (users.length !== 1) {
      return undefined
    }
    return users[0]
  }
}
