import type { DBHandle } from "@dotkomonline/db"
import type { MembershipWrite, User, UserFilterQuery, UserId, UserProfileSlug, UserWrite } from "@dotkomonline/types"
import invariant from "tiny-invariant"
import { type Pageable, pageQuery } from "../../query"

export interface UserRepository {
  findById(handle: DBHandle, userId: UserId): Promise<User | null>
  findByProfileSlug(handle: DBHandle, profileSlug: UserProfileSlug): Promise<User | null>
  update(handle: DBHandle, userId: UserId, data: Partial<UserWrite>): Promise<User>
  findMany(handle: DBHandle, query: UserFilterQuery, page: Pageable): Promise<User[]>
  /**
   * Register a new user to the database by their Auth0 subject claim.
   */
  register(handle: DBHandle, subject: string): Promise<User>
  createMembership(handle: DBHandle, userId: UserId, membership: MembershipWrite): Promise<User>
}

export function getUserRepository(): UserRepository {
  return {
    async register(handle, subject) {
      return await handle.user.upsert({
        where: { id: subject },
        update: { id: subject },
        create: { id: subject },
        include: {
          memberships: true,
        },
      })
    },
    async findById(handle, userId) {
      return await handle.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            include: {},
          },
        },
      })
    },
    async findByProfileSlug(handle, profileSlug) {
      const owUser = await handle.user.findUnique({ where: { profileSlug } })
      if (!owUser) {
        return null
      }
      return this.findById(handle, owUser.id)
    },
    async findMany(handle, query, page) {
      return await handle.user.findMany({
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
        select: {},
      })
      const user = await this.findById(handle, userId)
      invariant(user !== null, `User with id ${userId} not found after creating membership`)
      return user
    },
  }
}
