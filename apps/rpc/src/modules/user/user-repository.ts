import { randomUUID } from "node:crypto"
import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  GenderSchema,
  type MembershipId,
  type MembershipWrite,
  type User,
  type UserFilterQuery,
  type UserId,
  type Username,
  UserSchema,
  type UserWrite,
  type UserFlagWithUsers,
  UserFlagWithUsersSchema,
  type UserFlagWrite,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "@dotkomonline/utils"

/**
 * UserRepository is an interface for interacting with the user database.
 *
 * NOTE: The `userId` field in the table maps directly onto the OAuth2 subject claim.
 */
export interface UserRepository {
  /**
   * Register a new user to the database by their Auth0 subject claim.
   */
  register(handle: DBHandle, userId: UserId): Promise<User>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  findByUsername(handle: DBHandle, username: Username): Promise<User | null>
  findByWorkspaceUserIds(handle: DBHandle, workspaceUserIds: string[]): Promise<User[]>
  findMany(handle: DBHandle, query: UserFilterQuery, page: Pageable): Promise<User[]>

  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
  updateMembership(handle: DBHandle, membershipId: MembershipId, membership: Partial<MembershipWrite>): Promise<User>
  deleteMembership(handle: DBHandle, membershipId: MembershipId): Promise<User>

  createFlag(handle: DBHandle, data: UserFlagWrite): Promise<void>
  updateFlag(handle: DBHandle, name: string, data: Partial<UserFlagWrite>): Promise<void>
  deleteFlag(handle: DBHandle, name: string): Promise<void>
  findFlagByName(handle: DBHandle, name: string): Promise<UserFlagWithUsers | null>
  findFlagsByUserId(handle: DBHandle, userId: UserId): Promise<UserFlagWithUsers[]>
  assignFlagToUser(handle: DBHandle, userId: UserId, flagName: string): Promise<void>
  removeFlagFromUser(handle: DBHandle, userId: UserId, flagName: string): Promise<void>
}

export function getUserRepository(): UserRepository {
  return {
    async register(handle, subject) {
      const user = await handle.user.upsert({
        where: {
          id: subject,
        },
        update: {
          id: subject,
        },
        create: {
          id: subject,
          username: randomUUID(),
          gender: GenderSchema.enum.UNKNOWN,
        },
        include: {
          memberships: true,
          flags: true,
        },
      })

      return parseOrReport(UserSchema, user)
    },

    async update(handle, userId, data) {
      const row = await handle.user.update({
        where: {
          id: userId,
        },
        data,
        select: {
          id: true,
        },
      })

      const user = await this.findById(handle, row.id)
      invariant(user !== null, `User with id ${row.id} not found after update`)
      return user
    },

    async findById(handle, userId) {
      const user = await handle.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          memberships: true,
          flags: true,
        },
      })

      return parseOrReport(UserSchema.nullable(), user)
    },

    async findByUsername(handle, username) {
      const user = await handle.user.findUnique({
        where: {
          username,
        },
        include: {
          memberships: true,
          flags: true,
        },
      })

      if (!user) {
        return null
      }

      return parseOrReport(UserSchema.nullable(), user)
    },

    async findByWorkspaceUserIds(handle, workspaceUserIds) {
      const users = await handle.user.findMany({
        where: {
          workspaceUserId: { in: workspaceUserIds },
        },
        include: {
          memberships: true,
          flags: true,
        },
      })

      return parseOrReport(UserSchema.array(), users)
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
        include: {
          memberships: true,
          flags: true,
        },
      })

      return parseOrReport(UserSchema.array(), users)
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

    async deleteMembership(handle, membershipId) {
      const row = await handle.membership.delete({
        where: {
          id: membershipId,
        },
        select: {
          userId: true,
        },
      })

      const user = await this.findById(handle, row.userId)
      invariant(user !== null, `User with id ${row.userId} not found after deleting membership`)
      return user
    },

    async createFlag(handle, data) {
      await handle.userFlag.create({
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
        },
      })
    },

    async updateFlag(handle, name, data) {
      await handle.userFlag.update({
        where: {
          name,
        },
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
        },
      })
    },

    async deleteFlag(handle, name) {
      await handle.userFlag.delete({
        where: {
          name,
        },
      })
    },

    async findFlagByName(handle, name) {
      const flag = await handle.userFlag.findUnique({
        where: {
          name,
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profileSlug: true,
              imageUrl: true,
            },
          },
        },
      })

      return parseOrReport(UserFlagWithUsersSchema.nullable(), flag)
    },

    async findFlagsByUserId(handle, userId) {
      const flags = await handle.userFlag.findMany({
        where: {
          users: {
            some: {
              id: userId,
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              profileSlug: true,
              imageUrl: true,
            },
          },
        },
      })

      return parseOrReport(UserFlagWithUsersSchema.array(), flags)
    },

    async assignFlagToUser(handle, userId, flagName) {
      await handle.user.update({
        where: {
          id: userId,
        },
        data: {
          flags: {
            connect: {
              name: flagName,
            },
          },
        },
      })
    },

    async removeFlagFromUser(handle, userId, flagName) {
      await handle.user.update({
        where: {
          id: userId,
        },
        data: {
          flags: {
            disconnect: {
              name: flagName,
            },
          },
        },
      })
    },
  }
}
