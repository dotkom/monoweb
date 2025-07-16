import type { DBHandle } from "@dotkomonline/db"
import {
  type Auth0UserWrite,
  GenderSchema,
  MembershipSchema,
  type OwUser,
  type OwUserWrite,
  type User,
  UserFlagSchema,
  type UserId,
  type UserProfileSlug,
} from "@dotkomonline/types"
import type { GetUsers200ResponseOneOfInner, ManagementClient, UserCreate, UserUpdate } from "auth0"
import { hoursToMilliseconds } from "date-fns"
import { LRUCache } from "lru-cache"
import { z } from "zod"
import { BulkUserFetchError, UserCreationError, UserFetchError, UserUpdateError } from "./user-error"

export interface UserRepository {
  getById(handle: DBHandle, userId: UserId): Promise<User | null>
  getByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  getAll(handle: DBHandle, limit: number, page: number): Promise<User[]>
  update(
    handle: DBHandle,
    userId: UserId,
    auth0UserData: Partial<Auth0UserWrite>,
    owUserData: Partial<OwUserWrite>
  ): Promise<User>
  /**
   * @see https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
   */
  searchForUser(handle: DBHandle, query: string, limit: number, page: number): Promise<User[]>
  create(handle: DBHandle, auth0UserData: Auth0UserWrite, owUserData: OwUserWrite, password: string): Promise<User>
  getByIdWithFeideAccessToken(
    handle: DBHandle,
    userId: UserId
  ): Promise<{ user: User; feideAccessToken: string | null }>
  register(handle: DBHandle, auth0Id: string): Promise<void>
}

export function getUserRepository(managementClient: ManagementClient): UserRepository {
  const cache = new LRUCache<UserId, User>({
    max: 1000,
    ttl: hoursToMilliseconds(1),
  })

  return {
    async create(handle, auth0UserData, owUserData, password) {
      const response = await managementClient.users.create(mapAuth0UserWriteToCreate(auth0UserData, password))

      if (response.status !== 201) {
        throw new UserCreationError(response.status, response.statusText)
      }

      const owUser = await handle.owUser.create({
        data: {
          ...owUserData,
          id: response.data.user_id,
        },
      })

      const user = mapAuth0UserToUser(response.data, owUser)
      cache.set(user.id, user)

      return user
    },

    async register(handle, auth0Id) {
      await handle.owUser.upsert({
        where: { id: auth0Id },
        update: { id: auth0Id },
        create: { id: auth0Id },
      })
    },

    async getById(handle, userId) {
      const cachedUser = cache.get(userId)

      if (cachedUser !== undefined) {
        return cachedUser
      }

      const response = await managementClient.users.get({ id: userId })

      switch (response.status) {
        case 200: {
          let owUser = await handle.owUser.findUnique({ where: { id: userId } })
          owUser ??= await handle.owUser.create({ data: { id: userId } })

          const user = mapAuth0UserToUser(response.data, owUser)
          cache.set(user.id, user)

          return user
        }
        case 404:
          return null
        default:
          throw new UserFetchError(userId, response.status, response.statusText)
      }
    },

    async getByProfileSlug(handle, profileSlug) {
      const owUser = await handle.owUser.findUnique({ where: { profileSlug } })
      if (!owUser) {
        return null
      }
      return this.getById(handle, owUser.id)
    },

    async getByIdWithFeideAccessToken(handle, userId) {
      const response = await managementClient.users.get({ id: userId })

      if (response.status !== 200) {
        throw new UserFetchError(userId, response.status, response.statusText)
      }

      let owUser = await handle.owUser.findUnique({ where: { id: userId } })
      owUser ??= await handle.owUser.create({ data: { id: userId } })

      const user = mapAuth0UserToUser(response.data, owUser)
      cache.set(user.id, user)

      const feideIdentity = response.data.identities.find(({ connection }) => connection === "FEIDE")
      const feideAccessToken = feideIdentity?.access_token ?? null

      return { user, feideAccessToken }
    },

    async getAll(handle, limit, page) {
      const response = await managementClient.users.getAll({ per_page: limit, page: page })

      if (response.status !== 200) {
        throw new BulkUserFetchError(response.status, response.statusText)
      }

      const users = response.data.map(async (auth0User) => {
        let owUser = await handle.owUser.findUnique({ where: { id: auth0User.user_id } })
        owUser ??= await handle.owUser.create({ data: { id: auth0User.user_id } })

        const user = mapAuth0UserToUser(auth0User, owUser)
        cache.set(user.id, user)

        return user
      })

      return Promise.all(users)
    },

    async searchForUser(handle, query, limit, page) {
      // See https://auth0.com/docs/manage-users/user-search/user-search-query-syntax
      const response = await managementClient.users.getAll({ q: query, per_page: limit, page })

      if (response.status !== 200) {
        throw new BulkUserFetchError(response.status, response.statusText)
      }

      const users = response.data.map(async (auth0User) => {
        let owUser = await handle.owUser.findUnique({ where: { id: auth0User.user_id } })
        owUser ??= await handle.owUser.create({ data: { id: auth0User.user_id } })

        const user = mapAuth0UserToUser(auth0User, owUser)
        cache.set(user.id, user)

        return user
      })

      return Promise.all(users)
    },

    async update(handle, userId, auth0UserData, owUserData) {
      const response = await managementClient.users.update({ id: userId }, mapAuth0UserWriteToPatch(auth0UserData))

      if (response.status !== 200) {
        throw new UserUpdateError(userId, response.status, response.statusText)
      }

      const owUser = await handle.owUser.upsert({
        where: { id: userId },
        update: owUserData,
        create: { ...owUserData, id: userId },
      })

      const user = mapAuth0UserToUser(response.data, owUser)
      cache.set(user.id, user)

      return user
    },
  }
}

const getAuth0UserName = (auth0User: GetUsers200ResponseOneOfInner): string | null => {
  if (auth0User.name) {
    return auth0User.name
  }

  if (auth0User.firstName && auth0User.lastName) {
    const middleName = auth0User.user_metadata.middle_name
      ? z.string().safeParse(auth0User.user_metadata.middle_name).data
      : null

    if (middleName) {
      return `${auth0User.firstName} ${middleName} ${auth0User.lastName}`
    }

    return `${auth0User.firstName} ${auth0User.lastName}`
  }

  return auth0User.lastName || auth0User.firstName || null
}

const mapAuth0UserToUser = (auth0User: GetUsers200ResponseOneOfInner, owUser: OwUser): User => {
  const appMetadata: Record<string, unknown> = auth0User.app_metadata

  const createdAt = typeof auth0User.created_at === "string" ? new Date(auth0User.created_at) : null

  return {
    ...owUser,
    id: auth0User.user_id,
    createdAt,
    name: getAuth0UserName(auth0User) ?? "Ukjent bruker",
    email: auth0User.email,
    image: auth0User.picture,
    biography: z.string().safeParse(appMetadata.biography).data ?? null,
    allergies: z.string().safeParse(appMetadata.allergies).data ?? null,
    compiled: z.boolean().default(false).parse(appMetadata.compiled),
    gender: GenderSchema.safeParse(appMetadata.gender).data ?? null,
    phone: z.string().safeParse(appMetadata.phone).data ?? null,
    membership: MembershipSchema.safeParse(appMetadata.membership).data ?? null,
    ntnuUsername: z.string().safeParse(appMetadata.ntnu_username).data ?? null,
    flags: UserFlagSchema.safeParse(appMetadata.flags).data ?? [],
  }
}

const mapAuth0UserWriteToCreate = (user: Auth0UserWrite, password: string): UserCreate => ({
  email: user.email,
  name: user.name ?? undefined,
  picture: user.image ?? undefined,
  connection: "Username-Password-Authentication",
  password: password,
  app_metadata: {
    allergies: user.allergies,
    biography: user.biography,
    compiled: user.compiled,
    gender: user.gender,
    phone: user.phone,
    membership: user.membership,
    flags: user.flags,
  },
})

const mapAuth0UserWriteToPatch = (data: Partial<Auth0UserWrite>): UserUpdate => {
  const userUpdate: UserUpdate = {
    email: data.email,
    name: data.name,
    picture: data.image,
    app_metadata: {
      allergies: data.allergies,
      compiled: data.compiled,
      gender: data.gender,
      phone: data.phone,
      membership: data.membership,
      flags: data.flags,
    },
  }

  return userUpdate
}
