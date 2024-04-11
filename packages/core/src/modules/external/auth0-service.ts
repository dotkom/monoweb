import { type Logger, getLogger } from "@dotkomonline/logger"
import { type User, UserSchema } from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserUpdate } from "auth0"
import { InternalServerError } from "../../error"
import { GetUserServerError } from "./auth0-errors"

export interface Auth0Service {
  getById(sub: string): Promise<User | null>
  updateUser(sub: string, userData: UserUpdate): Promise<User>
}

export const mapToUser = (payload: User) => UserSchema.parse(payload)

// Until we have gather this data from the user, this fake data is used as the initial data for new users
const FAKE_USER_EXTRA_SIGNUP_DATA: UserUpdate = {
  givenName: "firstName",
  familyName: "lastName",
  name: "firstName lastName",
  allergies: ["allergy1", "allergy2"],
  profilePicture: "https://example.com/image.jpg",
  studyYear: -1,
  lastSyncedAt: new Date(),
  onBoarded: true,
  phoneNumber: "12345678",
  gender: "male",
}

export class Auth0ServiceImpl implements Auth0Service {
  private readonly logger: Logger = getLogger(Auth0ServiceImpl.name)
  constructor(private readonly client: ManagementClient) {}

  // Store all user data in app_metadata
  async updateUser(sub: string, write: UserUpdate) {
    const newUser: UserUpdate = {
      app_metadata: write,
    }

    const result = await this.client.users.update({ id: sub }, newUser)

    if (result.status !== 200) {
      this.logger.error("Error updating auth0 user", { status: result.status, message: result.statusText })
      throw new InternalServerError("An error occurred while updating user")
    }

    return this.mapAuth0ToDomainUser(result.data)
  }

  private async onboardUserWithFakeData(sub: string): Promise<User> {
    await this.updateUser(sub, FAKE_USER_EXTRA_SIGNUP_DATA)
    const onboardedUser = await this.client.users.get({
      id: sub,
    })
    return this.mapAuth0ToDomainUser(onboardedUser.data)
  }

  private mapAuth0ToDomainUser(user: GetUsers200ResponseOneOfInner): User {
    // check that created_at and updated_at are present and are both strings
    if (typeof user.created_at !== "string" || typeof user.updated_at !== "string") {
      console.error(user)
      throw new GetUserServerError("created_at or updated_at fields have unexpected type")
    }

    const app_metadata = user.app_metadata

    const mapped: User = {
      auth0Id: user.user_id,
      email: user.email,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      emailVerified: user.email_verified,

      name: app_metadata.name,
      allergies: app_metadata.allergies,
      phoneNumber: app_metadata.phoneNumber,
      profilePicture: app_metadata.profilePicture,
      lastSyncedAt: new Date(app_metadata.lastSyncedAt),
      familyName: app_metadata.familyName,
      givenName: app_metadata.givenName,
      studyYear: app_metadata.studyYear,
      onBoarded: app_metadata.onBoarded,
      gender: app_metadata.gender,
    }

    return UserSchema.parse(mapped)
  }

  async getById(sub: string): Promise<User | null> {
    const user = await this.client.users.get({
      id: sub,
    })

    if (user.status !== 200) {
      console.error(user)
      throw new GetUserServerError(user.statusText)
    }

    if (!(user.data.app_metadata.onBoarded === true)) {
      return this.onboardUserWithFakeData(sub)
    }

    return this.mapAuth0ToDomainUser(user.data)
  }
}
