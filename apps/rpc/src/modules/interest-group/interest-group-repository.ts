import type { DBHandle } from "@dotkomonline/db"
import type {
  EventId,
  InterestGroup,
  InterestGroupId,
  InterestGroupMember,
  InterestGroupWrite,
  UserId,
} from "@dotkomonline/types"

export interface InterestGroupRepository {
  getById(handle: DBHandle, interestGroupId: InterestGroupId): Promise<InterestGroup | null>
  getAll(handle: DBHandle): Promise<InterestGroup[]>
  create(handle: DBHandle, values: InterestGroupWrite): Promise<InterestGroup>
  update(
    handle: DBHandle,
    interestGroupId: InterestGroupId,
    values: Partial<InterestGroupWrite>
  ): Promise<InterestGroup>
  delete(handle: DBHandle, interestGroupId: InterestGroupId): Promise<void>
  getAllMembers(handle: DBHandle, interestGroupId: InterestGroupId): Promise<InterestGroupMember[]>
  getAllByMember(handle: DBHandle, userId: UserId): Promise<InterestGroup[]>
  addMember(handle: DBHandle, interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(handle: DBHandle, interestGroupId: InterestGroupId, userId: UserId): Promise<void>
  getAllByEventId(handle: DBHandle, eventId: EventId): Promise<InterestGroup[]>
}

export function getInterestGroupRepository(): InterestGroupRepository {
  return {
    async getById(handle, interestGroupId) {
      return await handle.interestGroup.findUnique({ where: { id: interestGroupId } })
    },
    async getAll(handle) {
      return await handle.interestGroup.findMany()
    },
    async create(handle, values) {
      return await handle.interestGroup.create({ data: values })
    },
    async update(handle, interestGroupId, values) {
      return await handle.interestGroup.update({ where: { id: interestGroupId }, data: values })
    },
    async delete(handle, interestGroupId) {
      await handle.interestGroup.delete({ where: { id: interestGroupId } })
    },
    async getAllMembers(handle, interestGroupId) {
      return await handle.interestGroupMember.findMany({ where: { interestGroupId } })
    },
    async getAllByMember(handle, userId) {
      return await handle.interestGroup.findMany({ where: { members: { some: { userId } } } })
    },
    async addMember(handle, interestGroupId, userId) {
      return await handle.interestGroupMember.create({ data: { interestGroupId, userId } })
    },
    async removeMember(handle, interestGroupId, userId) {
      await handle.interestGroupMember.delete({ where: { interestGroupId, userId } })
    },
    async getAllByEventId(handle, eventId) {
      return await handle.interestGroup.findMany({
        where: {
          events: {
            some: { eventId },
          },
        },
      })
    },
  }
}
