import type { DBHandle, Mark, PersonalMark } from "@dotkomonline/db"
import {
  type DashboardPersonalMark,
  DashboardPersonalMarkSchema,
  type MarkId,
  MarkSchema,
  PersonalMarkSchema,
  type UserId,
} from "@dotkomonline/types"
import z from "zod"
import { parseOrReport } from "../../invariant"

export interface PersonalMarkRepository {
  getByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  getAllByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  getDashboardByMarkId(handle: DBHandle, markId: MarkId): Promise<DashboardPersonalMark[]>
  getAllMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addToUserId(handle: DBHandle, userId: UserId, markId: MarkId, givenByid: UserId): Promise<PersonalMark>
  removeFromUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  getByUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
}

export function getPersonalMarkRepository(): PersonalMarkRepository {
  return {
    async getAllByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({ where: { userId } })
      return personalMarks.map((personalMark) => parseOrReport(PersonalMarkSchema, personalMark))
    },
    async getAllMarksByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({ where: { userId }, select: { mark: true } })
      return personalMarks.map((personalMark) => parseOrReport(MarkSchema, personalMark.mark))
    },
    async getDashboardByMarkId(handle, markId) {
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
        },
      })

      return parseOrReport(
        z.array(DashboardPersonalMarkSchema),
        personalMarks.map(({ user, givenBy, ...personalMark }) => ({
          personalMark,
          user,
          givenBy,
        }))
      )
    },
    async getByMarkId(handle, markId) {
      const personalMarks = await handle.personalMark.findMany({ where: { markId } })
      return personalMarks.map((personalMark) => parseOrReport(PersonalMarkSchema, personalMark))
    },
    async addToUserId(handle, userId, markId, givenById) {
      const personalMark = await handle.personalMark.create({ data: { userId, markId, givenById } })
      return parseOrReport(PersonalMarkSchema, personalMark)
    },
    async removeFromUserId(handle, userId, markId) {
      const personalMark = await handle.personalMark.delete({ where: { markId_userId: { userId, markId } } })
      return parseOrReport(PersonalMarkSchema, personalMark)
    },
    async getByUserId(handle, userId, markId) {
      const personalMark = await handle.personalMark.findUnique({ where: { markId_userId: { userId, markId } } })
      return personalMark ? parseOrReport(PersonalMarkSchema, personalMark) : null
    },
    async countUsersByMarkId(handle, markId) {
      return await handle.personalMark.count({ where: { markId } })
    },
  }
}
