import type { DBHandle } from "@dotkomonline/db"
import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"

export interface PersonalMarkRepository {
  getByMarkId(handle: DBHandle, markId: MarkId): Promise<PersonalMark[]>
  getAllByUserId(handle: DBHandle, userId: UserId): Promise<PersonalMark[]>
  getAllMarksByUserId(handle: DBHandle, userId: UserId): Promise<Mark[]>
  addToUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  removeFromUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark>
  getByUserId(handle: DBHandle, userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  countUsersByMarkId(handle: DBHandle, markId: MarkId): Promise<number>
}

export function getPersonalMarkRepository(): PersonalMarkRepository {
  return {
    async getAllByUserId(handle, userId) {
      return await handle.personalMark.findMany({ where: { userId } })
    },
    async getAllMarksByUserId(handle, userId) {
      const personalMarks = await handle.personalMark.findMany({ where: { userId }, select: { mark: true } })
      return personalMarks.map((personalMark) => personalMark.mark)
    },
    async getByMarkId(handle, markId) {
      return await handle.personalMark.findMany({ where: { markId } })
    },
    async addToUserId(handle, userId, markId) {
      return await handle.personalMark.create({ data: { userId, markId } })
    },
    async removeFromUserId(handle, userId, markId) {
      return await handle.personalMark.delete({ where: { markId_userId: { userId, markId } } })
    },
    async getByUserId(handle, userId, markId) {
      return await handle.personalMark.findUnique({ where: { markId_userId: { userId, markId } } })
    },
    async countUsersByMarkId(handle, markId) {
      return await handle.personalMark.count({ where: { markId } })
    },
  }
}
