import type { DBHandle } from "@dotkomonline/db"
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
  register(handle: DBHandle, auth0Id: string): Promise<void>
}

export function getUserRepository(managementClient: ManagementClient): UserRepository {
  const cache = new LRUCache<UserId, User>({
    max: 1000,
    ttl: hoursToMilliseconds(1),
  })
  return {
    async create(data, password) {
      const response = await managementClient.users.create(mapUserToAuth0UserCreate(data, password))
      if (response.status !== 201) {
        throw new UserCreationError(response.status, response.statusText)
      }

      const user = mapAuth0UserToUser(response.data)
      cache.set(user.id, user)
      return user
    },
    async register(handle, auth0Id) {
      await handle.owUser.upsert({
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
    },
    async getById(userId) {
      const cachedUser = cache.get(userId)
      if (cachedUser !== undefined) {
        return cachedUser
      }
      const response = await managementClient.users.get({ id: userId })
      switch (response.status) {
        case 200: {
          const user = mapAuth0UserToUser(response.data)
          cache.set(user.id, user)
          return user
        }
        case 404:
          return null
        default:
          throw new UserFetchError(userId, response.status, response.statusText)
      }
    },
    async getByIdWithFeideAccessToken(userId) {
      const response = await managementClient.users.get({ id: userId })
      if (response.status !== 200) {
        throw new UserFetchError(userId, response.status, response.statusText)
      }
      const user = mapAuth0UserToUser(response.data)
      cache.set(user.id, user)
      const feideIdentity = response.data.identities.find(({ connection }) => connection === "FEIDE")
      const feideAccessToken = feideIdentity?.access_token ?? null
      return { user, feideAccessToken }
    },
    async getAll(limit, page) {
      const response = await managementClient.users.getAll({ per_page: limit, page: page })
      if (response.status !== 200) {
        throw new BulkUserFetchError(response.status, response.statusText)
      }
      return response.data.map((auth0User) => {
        const user = mapAuth0UserToUser(auth0User)
        cache.set(user.id, user)
        return user
      })
    },
    async searchForUser(query, limit, page) {
      // See https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
      const response = await managementClient.users.getAll({ q: query, per_page: limit, page })
      if (response.status !== 200) {
        throw new BulkUserFetchError(response.status, response.statusText)
      }
      return response.data.map((auth0User) => {
        const user = mapAuth0UserToUser(auth0User)
        cache.set(user.id, user)
        return user
      })
    },
    async update(userId, data) {
      const response = await managementClient.users.update({ id: userId }, mapUserWriteToPatch(data))
      if (response.status !== 200) {
        throw new UserUpdateError(userId, response.status, response.statusText)
      }
      const user = mapAuth0UserToUser(response.data)
      cache.set(user.id, user)
      return user
    },
  }
}

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
