import type { DBClient } from "@dotkomonline/db"
import {
  GenderSchema,
  MembershipSchema,
  type User,
  UserFlagSchema,
  type UserId,
  type UserWrite,
  getDisplayName,
} from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserCreate, UserUpdate } from "auth0"
import { hoursToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"
import { z } from "zod"
import { BulkUserFetchError, UserCreationError, UserFetchError, UserUpdateError } from "./user-error"

const mapAuth0UserToUser = (auth0User: GetUsers200ResponseOneOfInner): User => {
  const appMetadata: Record<string, unknown> = auth0User.app_metadata ?? {}
  const firstName = auth0User.given_name ?? null
  const lastName = auth0User.family_name ?? null
  const displayName = getDisplayName({ name: auth0User.name, firstName, lastName })

  return {
    id: auth0User.user_id,
    firstName,
    lastName,
    email: auth0User.email,
    image: auth0User.picture,
    biography: z.string().safeParse(appMetadata.biography).data ?? null,
    address: z.string().safeParse(appMetadata.address).data ?? null,
    allergies: z.string().safeParse(appMetadata.allergies).data ?? null,
    rfid: z.string().safeParse(appMetadata.rfid).data ?? null,
    compiled: z.boolean().default(false).parse(appMetadata.compiled),
    gender: GenderSchema.safeParse(appMetadata.gender).data ?? null,
    phone: z.string().safeParse(appMetadata.phone).data ?? null,
    membership: MembershipSchema.safeParse(appMetadata.membership).data ?? null,
    displayName,
    flags: UserFlagSchema.safeParse(appMetadata.flags).data ?? [],
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
    flags: user.flags,
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
      flags: data.flags,
    },
  }

  return userUpdate
}

export interface UserRepository {
  getById(userId: UserId): Promise<User | null>
  getAll(limit: number, page: number): Promise<User[]>
  update(userId: UserId, data: Partial<UserWrite>): Promise<User>
  /**
   * @see https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
   */
  searchForUser(query: string, limit: number, page: number): Promise<User[]>
  create(data: UserWrite, password: string): Promise<User>
  getByIdWithFeideAccessToken(userId: UserId): Promise<{ user: User; feideAccessToken: string | null }>
  register(auth0Id: string): Promise<void>
}

export class UserRepositoryImpl implements UserRepository {
  private readonly client: ManagementClient
  private readonly db: DBClient
  private readonly cache: LRUCache<UserId, User> = new LRUCache<UserId, User>({
    max: 1000,
    ttl: hoursToMilliseconds(1),
  })

  constructor(client: ManagementClient, db: DBClient) {
    this.client = client
    this.db = db
  }

  public async create(data: UserWrite, password: string) {
    const response = await this.client.users.create(mapUserToAuth0UserCreate(data, password))

    if (response.status !== 201) {
      throw new UserCreationError(response.status, response.statusText)
    }

    const user = mapAuth0UserToUser(response.data)
    this.cache.set(user.id, user)

    return user
  }

  public async register(auth0Id: string) {
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
  }

  public async getById(userId: UserId) {
    const cachedUser = this.cache.get(userId)

    if (cachedUser) {
      return cachedUser
    }

    const response = await this.client.users.get({ id: userId })

    switch (response.status) {
      case 200: {
        const user = mapAuth0UserToUser(response.data)
        this.cache.set(user.id, user)

        return user
      }
      case 404:
        return null
      default:
        throw new UserFetchError(userId, response.status, response.statusText)
    }
  }

  public async getByIdWithFeideAccessToken(userId: UserId) {
    const response = await this.client.users.get({ id: userId })

    if (response.status !== 200) {
      throw new UserFetchError(userId, response.status, response.statusText)
    }

    const user = mapAuth0UserToUser(response.data)
    this.cache.set(user.id, user)

    const feideIdentity = response.data.identities.find(({ connection }) => connection === "FEIDE")
    const feideAccessToken = feideIdentity?.access_token ?? null

    return { user, feideAccessToken }
  }

  public async getAll(limit: number, page: number) {
    const response = await this.client.users.getAll({ per_page: limit, page: page })

    if (response.status !== 200) {
      throw new BulkUserFetchError(response.status, response.statusText)
    }

    return response.data.map((auth0User) => {
      const user = mapAuth0UserToUser(auth0User)
      this.cache.set(user.id, user)

      return user
    })
  }

  /**
   * @see https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
   */
  public async searchForUser(query: string, limit: number, page: number) {
    const response = await this.client.users.getAll({ q: query, per_page: limit, page: page })

    if (response.status !== 200) {
      throw new BulkUserFetchError(response.status, response.statusText)
    }

    return response.data.map((auth0User) => {
      const user = mapAuth0UserToUser(auth0User)
      this.cache.set(user.id, user)

      return user
    })
  }

  public async update(userId: UserId, data: Partial<UserWrite>) {
    const response = await this.client.users.update({ id: userId }, mapUserWriteToPatch(data))

    if (response.status !== 200) {
      throw new UserUpdateError(userId, response.status, response.statusText)
    }

    const user = mapAuth0UserToUser(response.data)
    this.cache.set(user.id, user)

    return user
  }
}
