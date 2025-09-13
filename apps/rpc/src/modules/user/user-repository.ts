import { randomUUID } from "node:crypto"
import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type MembershipId,
  type MembershipWrite,
  type User,
  type UserFilterQuery,
  type UserId,
  type UserProfileSlug,
  UserSchema,
  type UserWrite,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant.ts"
import { type Pageable, pageQuery } from "../../query.ts"

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
  updateMembership(handle: DBHandle, membershipId: MembershipId, membership: Partial<MembershipWrite>): Promise<User>
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
      const or = [
        ...(query.byName?.trim() ? [{ name: { contains: query.byName, mode: "insensitive" as const } }] : []),
        ...(query.byEmail?.trim() ? [{ email: { contains: query.byEmail, mode: "insensitive" as const } }] : []),
      ] satisfies Prisma.UserWhereInput[]

      const where: Prisma.UserWhereInput = or.length ? { OR: or } : {}

      const users = await handle.user.findMany({
        ...pageQuery(page),
        where,
        include: { memberships: true },
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
    async updateMembership(handle, membershipId, membership) {
      const row = await handle.membership.update({
        where: {
          id: membershipId,
        },
        data: {
          ...membership,
        },
        select: {
          userId: true,
        },
      })
      const user = await this.findById(handle, row.userId)
      invariant(user !== null, `User with id ${row.userId} not found after updating membership`)
      return user
    },
  }
}
