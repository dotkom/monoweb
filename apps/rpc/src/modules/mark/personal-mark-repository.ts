import type { DBHandle } from "@dotkomonline/db"
import {
  type Mark,
  type MarkId,
  type PersonalMark,
  type PersonalMarkDetails,
  PersonalMarkDetailsSchema,
  PersonalMarkSchema,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { mapMark } from "./mark-repository"

export interface PersonalMarkRepository {
  create(handle: DBHandle, userId: UserId, markId: MarkId, givenByUserId?: UserId): Promise<PersonalMark>
  delete(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  findByUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  findManyByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  findManyByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  findDetailsByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMarkDetails[]>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>

  /** Note that this is `Mark` and NOT `PersonalMark` */
  findMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
}

export function getPersonalMarkRepository(): PersonalMarkRepository {
  return {
    async findManyByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { userId },
      })

      return parseOrReport(PersonalMarkSchema.array(), personalMarks)
    },

    async findMarksByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { userId },
        include: {
          mark: {
            include: {
              groups: {
                include: {
                  group: {
                    include: {
                      roles: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      return personalMarks.map((personalMark) => mapMark(personalMark.mark, personalMark.mark.groups))
    },

    async findDetailsByMarkId(handle, markId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { markId },
        include: {
          user: {
            select: {
              id: true,
              profileSlug: true,
              name: true,
              imageUrl: true,
              biography: true,
            },
          },
          givenBy: {
            select: {
              id: true,
              profileSlug: true,
              name: true,
              imageUrl: true,
              biography: true,
            },
          },
          mark: {
            select: {
              groups: {
                include: {
                  group: {
                    include: {
                      roles: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      return parseOrReport(
        PersonalMarkDetailsSchema.array(),
        personalMarks.map(({ user, mark: { groups: givenByGroups }, givenBy, ...personalMark }) => ({
          personalMark,
          user,
          givenBy,
          givenByGroups: givenByGroups.map((group) => group.group),
        }))
      )
    },

    async findManyByMarkId(handle, markId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { markId },
      })

      return parseOrReport(PersonalMarkSchema.array(), personalMarks)
    },

    async create(handle, userId, markId, givenByUserId) {
      const personalMark = await handle.personalMark.create({
        data: { userId, markId, givenById: givenByUserId },
      })

      return parseOrReport(PersonalMarkSchema, personalMark)
    },

    async delete(handle, userId, markId) {
      const personalMark = await handle.personalMark.delete({
        where: { markId_userId: { userId, markId } },
      })

      return parseOrReport(PersonalMarkSchema, personalMark)
    },

    async findByUserId(handle, userId, markId) {
      const personalMark = await handle.personalMark.findUnique({
        where: { markId_userId: { userId, markId } },
      })

      return parseOrReport(PersonalMarkSchema.nullable(), personalMark)
    },

    async countUsersByMarkId(handle, markId) {
      return await handle.personalMark.count({ where: { markId } })
    },
  }
}
