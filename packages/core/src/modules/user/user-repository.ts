import type { Database } from "@dotkomonline/db"
import { GenderSchema, type User, type UserId, type UserWrite } from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserCreate, UserUpdate } from "auth0"
import type { Kysely } from "kysely"
import { z } from "zod"

export const AppMetadataProfileSchema = z.object({
  phone: z.string().nullable(),
  gender: GenderSchema,
  address: z.string().nullable(),
  compiled: z.boolean(),
  allergies: z.array(z.string()),
  rfid: z.string().nullable(),
})

export const AppMetadataSchema = z.object({
  ow_user_id: z.string().optional(),
  profile: AppMetadataProfileSchema.optional(),
})

type AppMetadata = z.infer<typeof AppMetadataSchema>

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, page: number): Promise<User[]>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchForUser(query: string, limit: number, page: number): Promise<User[]>
  registerId(id: UserId): Promise<void>
  createDummyUser(data: UserWrite, password: string): Promise<User>
}

const mapAuth0UserToUser = (auth0User: GetUsers200ResponseOneOfInner): User => {
  const app_metadata_parsed = AppMetadataSchema.safeParse(auth0User.app_metadata)

  const metadata_profile = app_metadata_parsed.success ? (app_metadata_parsed.data.profile ?? null) : null

  return {
    id: auth0User.user_id,
    email: auth0User.email,
    image: auth0User.picture,
    emailVerified: auth0User.email_verified,
    profile: metadata_profile
      ? {
          firstName: auth0User.given_name,
          lastName: auth0User.family_name,
          phone: metadata_profile.phone,
          gender: metadata_profile.gender,
          allergies: metadata_profile.allergies,
          rfid: metadata_profile.rfid,
          compiled: metadata_profile.compiled,
          address: metadata_profile.address,
        }
      : undefined,
  }
}

const mapUserToAuth0UserCreate = (user: Omit<User, "id">, password: string): UserCreate => {
  const auth0User: UserCreate = {
    email: user.email,
    email_verified: user.emailVerified,
    picture: user.image ?? undefined,
    connection: "Username-Password-Authentication",
    password: password,
  }

  if (user.profile) {
    const { firstName, lastName, ...profile } = user.profile

    auth0User.app_metadata = { profile }
    auth0User.given_name = firstName
    auth0User.family_name = lastName

    if (firstName && lastName) {
      auth0User.name = `${firstName} ${lastName}`
    }
  }

  return auth0User
}

const mapUserWriteToPatch = (data: Partial<UserWrite>): UserUpdate => {
  const userUpdate: UserUpdate = {
    email: data.email,
    image: data.image,
  }
  const appMetadata: AppMetadata = {}

  if (data.profile) {
    const { firstName, lastName, ...profile } = data.profile

    appMetadata.profile = profile
    userUpdate.given_name = firstName
    userUpdate.family_name = lastName
    userUpdate.app_metadata = appMetadata

    if (userUpdate.given_name && userUpdate.family_name) {
      userUpdate.name = `${userUpdate.given_name} ${userUpdate.family_name}`
    }
  }

  return userUpdate
}

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly client: ManagementClient,
    private readonly db: Kysely<Database>
  ) {}

  async registerId(id: UserId): Promise<void> {
    await this.db
      .insertInto("owUser")
      .values({ id })
      .onConflict((oc) => oc.doNothing())
      .execute()
  }

  async createDummyUser(data: Omit<User, "id">, password: string): Promise<User> {
    const response = await this.client.users.create(mapUserToAuth0UserCreate(data, password))

    if (response.status !== 201) {
      throw new Error(`Failed to create user: ${response.statusText}`)
    }

    await this.registerId(response.data.user_id)

    const user = await this.getById(response.data.user_id)
    if (user === null) {
      throw new Error("Failed to fetch user after creation")
    }

    return user
  }
      
  async getById(id: UserId): Promise<User | null> {
    const user = await this.client.users.get({ id: id })

    switch (user.status) {
      case 200:
        return mapAuth0UserToUser(user.data)
      case 404:
        return null
      default:
        throw new Error(`Failed to fetch user with id ${id}: ${user.statusText}`)
    }
  }

  async getAll(limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ per_page: limit, page: page })

    return users.data.map(mapAuth0UserToUser)
  }

  async searchForUser(query: string, limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ q: query, per_page: limit, page: page })

    return users.data.map(mapAuth0UserToUser)
  }

  async update(id: UserId, data: Partial<UserWrite>) {
    const result = await this.client.users.update({ id }, mapUserWriteToPatch(data))

    const user = await this.client.users.get({ id })

    if (user.status !== 200) {
      throw new Error(`Failed to fetch user with id ${id}: ${user.statusText}`)
    }

    return mapAuth0UserToUser(user.data)
  }
}
