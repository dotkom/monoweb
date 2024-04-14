import { type Logger, getLogger } from "@dotkomonline/logger"
import { type User, UserSchema, type UserWrite } from "@dotkomonline/types"
import type { UserUpdate as Auth0UserUpdate, GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"
import { InternalServerError } from "../../error"
import { GetUserServerError } from "./auth0-errors"

export interface Auth0Service {
  getById(sub: string): Promise<User | null>
  updateUser(sub: string, userData: UserWrite): Promise<User>
}

// Until we have gather this data from the user, this fake data is used as the initial data for new users
const FAKE_USER_EXTRA_SIGNUP_DATA: Omit<UserWrite, "email" | "id"> = {
  givenName: "firstName",
  familyName: "lastName",
  name: "firstName lastName",
  allergies: ["allergy1", "allergy2"],
  picture: "https://example.com/image.jpg",
  studyYear: -1,
  lastSyncedAt: new Date(),
  phone: "12345678",
  gender: "male",
}

export const mapToUser = (payload: User) => UserSchema.parse(payload)

export class Auth0ServiceImpl implements Auth0Service {
  private readonly logger: Logger = getLogger(Auth0ServiceImpl.name)
  constructor(private readonly client: ManagementClient) {}

  // Store all user data in app_metadata
  async updateUser(sub: string, write: UserWrite) {
    const newUser: Auth0UserUpdate = {
      app_metadata: {
        study_year: write.studyYear,
        last_synced_at: write.lastSyncedAt,
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

    return this.mapAuth0ToDomainUser(result.data)
  }

  private mapAuth0ToDomainUser(user: GetUsers200ResponseOneOfInner): User {
    // check that created_at and updated_at are present and are both strings
    const app_metadata = user.app_metadata
    const user_metadata = user.user_metadata

    const mapped: User = {
      id: user.user_id,
      email: user.email,
      name: user.name,
      familyName: user.family_name,
      givenName: user.given_name,
      picture: user.picture,

      studyYear: app_metadata.study_year,
      lastSyncedAt: new Date(app_metadata.last_synced_at),

      gender: user_metadata.gender,
      allergies: user_metadata.allergies,
      phone: user_metadata.phone,
    }

    return UserSchema.parse(mapped)
  }

  // Email is the only thing that we gather currently
  private async populateUserWithFakeData(id: string, email: string): Promise<User> {
    const userWrite = {
      id,
      email,
      ...FAKE_USER_EXTRA_SIGNUP_DATA,
    }
    const user = await this.updateUser(id, userWrite)
    return user
  }

  async getById(sub: string): Promise<User | null> {
    const user = await this.client.users.get({
      id: sub,
    })

    if (user.status !== 200) {
      console.error(user)
      throw new GetUserServerError(user.statusText)
    }

    // An onboarded user has a study_year set (-1 if no membership), so if it is undefined it means the user has not been onboarded. Fill with fake data for now.
    const a = user.data.app_metadata?.study_year
    console.log(a)

    if (user.data.app_metadata?.study_year === undefined) {
      return this.populateUserWithFakeData(sub, user.data.email)
    }

    return this.mapAuth0ToDomainUser(user.data)
  }
}
