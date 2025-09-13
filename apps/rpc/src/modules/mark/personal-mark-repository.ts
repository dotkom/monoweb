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
import z from "zod"
import { parseOrReport } from "../../invariant.ts"
import { mapMark } from "./mark-repository.ts"

export interface PersonalMarkRepository {
  getByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  getAllByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  getDetailsByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMarkDetails[]>
  getAllMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addToUserId(handle: DBHandle, userId: UserId, markId: MarkId, givenByid?: UserId): Promise<PersonalMark>
  removeFromUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  getByUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
}

export function getPersonalMarkRepository(): PersonalMarkRepository {
  return {
    async getAllByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { userId },
      })
      return personalMarks.map((personalMark) => parseOrReport(PersonalMarkSchema, personalMark))
    },
    async getAllMarksByUserId(handle, userId) {
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
    async getDetailsByMarkId(handle, markId) {
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
        z.array(PersonalMarkDetailsSchema),
        personalMarks.map(({ user, mark: { groups: givenByGroups }, givenBy, ...personalMark }) => ({
          personalMark,
          user,
          givenBy,
          givenByGroups: givenByGroups.map((group) => group.group),
        }))
      )
    },
    async getByMarkId(handle, markId) {
      const personalMarks = await handle.personalMark.findMany({
        where: { markId },
      })
      return personalMarks.map((personalMark) => parseOrReport(PersonalMarkSchema, personalMark))
    },
    async addToUserId(handle, userId, markId, givenById) {
      const personalMark = await handle.personalMark.create({
        data: { userId, markId, givenById },
      })
      return parseOrReport(PersonalMarkSchema, personalMark)
    },
    async removeFromUserId(handle, userId, markId) {
      const personalMark = await handle.personalMark.delete({
        where: { markId_userId: { userId, markId } },
      })
      return parseOrReport(PersonalMarkSchema, personalMark)
    },
    async getByUserId(handle, userId, markId) {
      const personalMark = await handle.personalMark.findUnique({
        where: { markId_userId: { userId, markId } },
      })
      return personalMark ? parseOrReport(PersonalMarkSchema, personalMark) : null
    },
    async countUsersByMarkId(handle, markId) {
      return await handle.personalMark.count({ where: { markId } })
    },
  }
}
