import type { Database } from "@dotkomonline/db"
import { AppMetadataSchema, type User, type UserId, UserMetadataSchema, UserMetadataWrite } from "@dotkomonline/types"
import { type Insertable, type Kysely, type Selectable, sql } from "kysely"
import { type Cursor, orderedQuery, withInsertJsonValue } from "../../utils/db-utils"
import { GetUsers200ResponseOneOfInner, ManagementClient } from "auth0"

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, page: number): Promise<User[]>
  updateMetadata(id: UserId, data: UserMetadataWrite): Promise<UserMetadataWrite>
  searchForUser(query: string, limit: number, page: number): Promise<User[]>
  registerId(id: UserId): Promise<void>
}

const mapToUser = (auth0User: GetUsers200ResponseOneOfInner): User => {
  const metadata = UserMetadataSchema.safeParse(auth0User.user_metadata);
  const app_metadata = AppMetadataSchema.safeParse(auth0User.app_metadata);

  return {
    id: auth0User.user_id,
    email: auth0User.email,
    firstName: auth0User.given_name,
    lastName: auth0User.family_name,
    image: auth0User.picture,
    emailVerified: auth0User.email_verified,
    metadata: metadata.success ? metadata.data : null,
    app_metadata: app_metadata.success ? app_metadata.data : null,
  }
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly client: ManagementClient, private readonly db: Kysely<Database>) {}

  async registerId(id: UserId): Promise<void> {
    await this.db.insertInto("owUser")
      .values({ id })
      .onConflict(oc => oc.doNothing())
      .execute()
  }

  async getById(id: UserId): Promise<User | null> {
    const user = await this.client.users.get({ id: id })

    switch (user.status) {
      case 200:
        return mapToUser(user.data)
      case 404:
        return null
      default:
        throw new Error(`Failed to fetch user with id ${id}: ${user.statusText}`)
    }
  }

  async getAll(limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ per_page: limit, page: page })

    return users.data.map(mapToUser)
  }

  async searchForUser(query: string, limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ q: query, per_page: limit, page: page })

    return users.data.map(mapToUser)
  }

  async updateMetadata(id: UserId, data: UserMetadataWrite) {
    const existingUser = await this.getById(id)

    if (!existingUser) {
      throw new Error(`User with id ${id} not found`)
    }

    const newMetadata = {
      ...existingUser.metadata,
      ...data,
    }

    await this.client.users.update({ id: id }, {
      user_metadata: newMetadata
    })

    return newMetadata
  }
}
