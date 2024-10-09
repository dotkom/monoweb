import { type Logger, getLogger } from "@dotkomonline/logger"
import { type User, UserSchema, type UserWrite } from "@dotkomonline/types"
import type { UserUpdate as Auth0UserUpdate, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { InternalServerError } from "../../error"
import { GetUserServerError } from "./auth0-errors"

export interface Auth0Repository {
  get(auth0Id: string): Promise<Auth0User | null>
  update(auth0Id: string, data: Auth0UserWrite): Promise<Auth0User>
}

type Auth0User = GetUsers200ResponseOneOfInner
type Auth0UserWrite = Auth0UserUpdate

export class Auth0RepositoryImpl implements Auth0Repository {
  private readonly logger: Logger = getLogger(Auth0RepositoryImpl.name)
  constructor(private readonly client: ManagementClient) {}

  async get(id: string): Promise<Auth0User | null> {
    const user = await this.client.users.get({ id })

    if (user.status !== 200) {
      this.logger.error("Received non 200 status code when trying to get user from auth0", { status: user.status })
      throw new GetUserServerError(user.statusText)
    }

    return user.data
  }

  async update(auth0Id: string, data: Auth0UserWrite): Promise<Auth0User> {
    const user = await this.client.users.update({ id: auth0Id }, data)

    if (user.status !== 200) {
      this.logger.error("Received non 200 status code when trying to update user in auth0", { status: user.status })
      throw new InternalServerError("Failed to update user in auth0")
    }

    return user.data
  }
}
