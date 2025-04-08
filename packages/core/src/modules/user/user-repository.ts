import type { DBClient } from "@dotkomonline/db"
import { GenderSchema, type User, type UserId, type UserWrite } from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserCreate, UserUpdate } from "auth0"
import { z } from "zod"

export interface UserRepository {
  getById(id: UserId): Promise<User | null>
  getAll(limit: number, page: number): Promise<User[]>
  update(id: UserId, data: Partial<UserWrite>): Promise<User>
  searchForUser(query: string, limit: number, page: number): Promise<User[]>
  create(data: UserWrite, password: string): Promise<User>
  getWithFeideAccessTokenById(id: UserId): Promise<{ user: User | null; accessToken: string | null }>
  registerAndGet(auth0Id: string): Promise<User>
}

const mapAuth0UserToUser = (auth0User: GetUsers200ResponseOneOfInner): User => {
  const appMetadata: Record<string, unknown> = auth0User.app_metadata ?? {}

  return {
    id: auth0User.user_id,
    firstName: auth0User.given_name,
    lastName: auth0User.family_name,
    email: auth0User.email,
    image: auth0User.picture,
    biography: z.string().safeParse(appMetadata.biography).data ?? null,
    address: z.string().safeParse(appMetadata.address).data ?? null,
    allergies: z.string().safeParse(appMetadata.allergies).data ?? null,
    rfid: z.string().safeParse(appMetadata.rfid).data ?? null,
    compiled: z.boolean().default(false).parse(appMetadata.compiled),
    gender: GenderSchema.safeParse(appMetadata.gender).data ?? null,
    phone: z.string().safeParse(appMetadata.phone).data ?? null,
    membership: MembershipSchema.safeParse(appMetadata.membership).data,
  }
}

const mapUserToAuth0UserCreate = (user: UserWrite, password: string): UserCreate => ({
  email: user.email,
  name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
  given_name: user.firstName ?? undefined,
  family_name: user.lastName ?? undefined,
  picture: user.image ?? undefined,
  connection: "Username-Password-Authentication",
  password: password,
  app_metadata: {
    rfid: user.rfid,
    allergies: user.allergies,
    biography: user.biography,
    compiled: user.compiled,
    address: user.address,
    gender: user.gender,
    phone: user.phone,
    membership: user.membership,
  },
})

const mapUserWriteToPatch = (data: Partial<UserWrite>): UserUpdate => {
  const userUpdate: UserUpdate = {
    email: data.email,
    family_name: data.lastName,
    given_name: data.firstName,
    name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
    picture: data.image,
    app_metadata: {
      address: data.address,
      allergies: data.allergies,
      rfid: data.rfid,
      compiled: data.compiled,
      gender: data.gender,
      phone: data.phone,
      membership: data.membership,
    },
  }

  return userUpdate
}

export class UserRepositoryImpl implements UserRepository {
  private readonly client: ManagementClient
  private readonly db: DBClient

  constructor(client: ManagementClient, db: DBClient) {
    this.client = client
    this.db = db
  }

  async create(data: Omit<User, "id">, password: string): Promise<User> {
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

  async registerAndGet(auth0Id: string): Promise<User> {
    const user = await this.getById(auth0Id)
    if (user === null) {
      throw new Error("Failed to fetch user after registration")
    }

    await this.db.owUser.upsert({
      where: {
        id: auth0Id,
      },
      update: {
        id: auth0Id,
      },
      create: {
        id: auth0Id,
      },
    })

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

  async getWithFeideAccessTokenById(id: UserId): Promise<{ user: User | null; accessToken: string | null }> {
    const user = await this.client.users.get({ id })

    if (user.status !== 200) {
      return { user: null, accessToken: null }
    }

    for (const identity of user.data.identities) {
      if (identity.connection === "FEIDE") {
        return { user: mapAuth0UserToUser(user.data), accessToken: identity.access_token }
      }
    }

    return { user: mapAuth0UserToUser(user.data), accessToken: null }
  }

  async getAll(limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ per_page: limit, page: page })

    if (users.status !== 200) {
      throw new Error(`Failed to fetch users: ${users.statusText}`)
    }

    return users.data.map(mapAuth0UserToUser)
  }

  // https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
  async searchForUser(query: string, limit: number, page: number): Promise<User[]> {
    const users = await this.client.users.getAll({ q: query, per_page: limit, page: page })

    return users.data.map(mapAuth0UserToUser)
  }

  async update(id: UserId, data: Partial<UserWrite>) {
    const user = await this.client.users.update({ id }, mapUserWriteToPatch(data))

    if (user.status !== 200) {
      throw new Error(`Failed to fetch user with id ${id}: ${user.statusText}`)
    }

    return mapAuth0UserToUser(user.data)
  }
}
