import type { Database } from "@dotkomonline/db"
import { GenderSchema, type User, type UserId, type UserWrite } from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserCreate, UserUpdate } from "auth0"
import type { Kysely } from "kysely"
import { z } from "zod"

export const AppMetadataProfileSchema = z.object({
  phone: z.string(),
  gender: GenderSchema,
  address: z.string(),
  compiled: z.boolean().default(false),
  allergies: z.string(),
  rfid: z.string()
})

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, page: number): Promise<User[]>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchForUser(query: string, limit: number, page: number): Promise<User[]>
  createDummyUser(data: UserWrite, password: string): Promise<User>
}

const mapAuth0UserToUser = (auth0User: GetUsers200ResponseOneOfInner): User => {
  const appMetadata: Record<string, unknown> = auth0User.app_metadata ?? {};

  return {
    id: auth0User.user_id,
    firstName: auth0User.given_name,
    lastName: auth0User.family_name,
    email: auth0User.email,
    phone: auth0User.app_metadata?.phone,
    image: auth0User.picture,
    address: typeof appMetadata.address === "string" ? appMetadata.address : undefined,
    allergies: typeof appMetadata.allergies === "string" ? appMetadata.allergies : undefined,
    rfid: typeof appMetadata.rfid === "string" ? appMetadata.rfid : undefined,
    compiled: typeof appMetadata.compiled === "boolean" ? appMetadata.compiled : false,
  }
}

const mapUserToAuth0UserCreate = (user: UserWrite, password: string): UserCreate => ({
  email: user.email,
  name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
  given_name: user.firstName,
  family_name: user.lastName,
  picture: user.image ?? undefined,
  connection: "Username-Password-Authentication",
  password: password,
  app_metadata: {
    phone: user.phone,
    rfid: user.rfid,
    allergies: user.allergies,
    compiled: user.compiled,
    address: user.address,
  }
})

const mapUserWriteToPatch = (data: Partial<UserWrite>): UserUpdate => {
  const userUpdate: UserUpdate = {
    email: data.email,
    image: data.image,
    family_name: data.lastName,
    given_name: data.firstName,
    name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
    app_metadata: {
      phone: data.phone,
      address: data.address,
      allergies: data.allergies,
      rfid: data.rfid,
      compiled: data.compiled
    }
  }

  return userUpdate
}

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly client: ManagementClient,
  ) {}

  async createDummyUser(data: Omit<User, "id">, password: string): Promise<User> {
    const response = await this.client.users.create(mapUserToAuth0UserCreate(data, password))

    if (response.status !== 201) {
      throw new Error(`Failed to create user: ${response.statusText}`)
    }

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

    if (users.status !== 200) {
      throw new Error(`Failed to fetch users: ${users.statusText}`)
    }

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
