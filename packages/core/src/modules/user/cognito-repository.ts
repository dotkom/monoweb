import { CognitoSubject, CognitoUser, mapToCognitoUser } from "@dotkomonline/types"
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  paginateListUsers,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider"
import { env } from "@dotkomonline/env"
import * as node
import * as util from "util"

export interface CognitoRepository {
  getBySubject(id: CognitoSubject): Promise<CognitoUser | undefined>
  getAll(): Promise<CognitoUser[]>
}

export class CognitoRepositoryImpl implements CognitoRepository {
  private static STANDARD_ATTRIBUTES = ["given_name", "family_name", "gender", "email", "email_verified", "sub"]

  constructor(private readonly cognitoClient: CognitoIdentityProviderClient) {}

  async getBySubject(id: CognitoSubject): Promise<CognitoUser | undefined> {
    const cmd = new ListUsersCommand({
      Filter: `sub = "${id}"`,
      AttributesToGet: CognitoRepositoryImpl.STANDARD_ATTRIBUTES,
      Limit: 1,
      UserPoolId: env.AWS_COGNITO_POOL_ID,
    })
    const result = await this.cognitoClient.send(cmd)
    return result.Users?.length === 1 ? mapToCognitoUser(result.Users[0]) : undefined
  }
  async getAll(): Promise<CognitoUser[]> {
    const users: UserType[] = []
    const asyncGenerator = paginateListUsers(
      {
        client: this.cognitoClient,
      },
      {
        Filter: "cognito:user_status = \"CONFIRMED\"",
        AttributesToGet: CognitoRepositoryImpl.STANDARD_ATTRIBUTES,
        UserPoolId: env.AWS_COGNITO_POOL_ID,
      }
    )
    for await (const result of asyncGenerator) {
      if (result.Users !== undefined) {
        users.push(...result.Users)
      }
    }
    return users.map(mapToCognitoUser)
  }
}
