import type { DBHandle } from "@dotkomonline/db"
import {
  type MembershipWrite,
  type User,
  type UserFilterQuery,
  type UserId,
  type UserProfileSlug,
  UserSchema,
  type UserWrite,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"
import { randomUUID } from "node:crypto"

/**
 * UserRepository is an interface for interacting with the user database.
 *
 * NOTE: The `userId` field in the table maps directly onto the OAuth2 subject claim.
 */
export interface UserRepository {
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  findByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  findMany(handle: DBHandle, query: UserFilterQuery, page: Pageable): Promise<User[]>
  /**
   * Register a new user to the database by their Auth0 subject claim.
   */
  register(handle: DBHandle, userId: UserId): Promise<User>
  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
}

export function getUserRepository(): UserRepository {
  return {
    async register(handle, subject) {
      const user = await handle.user.upsert({
        where: { id: subject },
        update: { id: subject },
        create: { id: subject, profileSlug: randomUUID() },
        include: {
          memberships: true,
        },
      })
      return parseOrReport(UserSchema, user)
    },
    async findById(handle, userId) {
      const user = await handle.user.findUnique({
        where: { id: userId },
        include: {
          memberships: true,
        },
      })
      return parseOrReport(UserSchema.nullable(), user)
    },
    async findByProfileSlug(handle, profileSlug) {
      const owUser = await handle.user.findUnique({ where: { profileSlug } })
      if (!owUser) {
        return null
      }
      return this.findById(handle, owUser.id)
    },
    async findMany(handle, query, page) {
      const users = await handle.user.findMany({
        ...pageQuery(page),
        where: {
          AND: [
            {
              name:
                query.byName !== null
                  ? {
                      contains: query.byName,
                    }
                  : undefined,
            },
          ],
        },
        include: {
          memberships: true,
        },
      })
      return users.map((user) => parseOrReport(UserSchema, user))
    },
    async update(handle, userId, data) {
      const row = await handle.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
        },
      })
      const user = await this.findById(handle, row.id)
      invariant(user !== null, `User with id ${row.id} not found after update`)
      return user
    },
    async createMembership(handle, userId, membership) {
      await handle.membership.create({
        data: {
          ...membership,
          userId,
        },
        select: {
          id: true,
        },
      })
      const user = await this.findById(handle, userId)
      invariant(user !== null, `User with id ${userId} not found after creating membership`)
      return user
    },
  }
}
