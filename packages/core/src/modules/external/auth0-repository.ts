import { type Logger, getLogger } from "@dotkomonline/logger"
import { type User, UserSchema, type UserWrite } from "@dotkomonline/types"
import type { UserUpdate as Auth0UserUpdate, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { InternalServerError } from "../../error"
import { GetUserServerError } from "./auth0-errors"

export interface Auth0Repository {
  getByAuth0UserId(auth0Id: string): Promise<User | null>
  update(auth0Id: string, data: UserWrite): Promise<User>
}

function mapToUser(user: GetUsers200ResponseOneOfInner): User {
  // check that created_at and updated_at are present and are both strings
  const app_metadata = user.app_metadata
  const user_metadata = user.user_metadata

  const mapped: User = {
    auth0Id: user.user_id,
    email: user.email,
    name: user.name,
    familyName: user.family_name,
    givenName: user.given_name,
    picture: user.picture,

    studyYear: app_metadata.study_year,
    id: app_metadata.ow_user_id,

    gender: user_metadata.gender,
    allergies: user_metadata.allergies,
    phone: user_metadata.phone,
  }

  return UserSchema.parse(mapped)
}

export class Auth0RepositoryImpl implements Auth0Repository {
  private readonly logger: Logger = getLogger(Auth0RepositoryImpl.name)
  constructor(private readonly client: ManagementClient) {}

  // Store all user data in app_metadata
  async update(sub: string, write: UserWrite) {
    const newUser: Auth0UserUpdate = {
      app_metadata: {
        study_year: write.studyYear,
        ow_user_id: write.id,
      },
      user_metadata: {
        allergies: write.allergies,
        gender: write.gender,
        phone: write.phone,
      },
      family_name: write.familyName,
      given_name: write.givenName,
      name: write.name,
      picture: write.picture,
      email: write.email,
    }

    const result = await this.client.users.update({ id: sub }, newUser)

    if (result.status !== 200) {
      this.logger.error("Error updating auth0 user", { status: result.status, message: result.statusText })
      throw new InternalServerError("An error occurred while updating user")
    }

    return mapToUser(result.data)
  }

  async getByAuth0UserId(id: string): Promise<User | null> {
    const user = await this.client.users.get({ id })

    if (user.status !== 200) {
      this.logger.error("Received non 200 status code when trying to get user from auth0", { status: user.status })
      throw new GetUserServerError(user.statusText)
    }

    return mapToUser(user.data)
  }
}
