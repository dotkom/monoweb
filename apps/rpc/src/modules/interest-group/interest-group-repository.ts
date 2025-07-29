import type { DBHandle } from "@dotkomonline/db"
import {
  type EventId,
  type InterestGroup,
  type InterestGroupId,
  type InterestGroupMember,
  InterestGroupMemberSchema,
  InterestGroupSchema,
  type InterestGroupWrite,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

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
      const group = await handle.interestGroup.findUnique({ where: { id: interestGroupId } })
      return parseOrReport(InterestGroupSchema, group)
    },
    async getAll(handle) {
      const groups = await handle.interestGroup.findMany()
      return groups.map((group) => parseOrReport(InterestGroupSchema, group))
    },
    async create(handle, values) {
      const group = await handle.interestGroup.create({ data: values })
      return parseOrReport(InterestGroupSchema, group)
    },
    async update(handle, interestGroupId, values) {
      const group = await handle.interestGroup.update({ where: { id: interestGroupId }, data: values })
      return parseOrReport(InterestGroupSchema, group)
    },
    async delete(handle, interestGroupId) {
      await handle.interestGroup.delete({ where: { id: interestGroupId } })
    },
    async getAllMembers(handle, interestGroupId) {
      const members = await handle.interestGroupMember.findMany({ where: { interestGroupId } })
      return members.map((member) => parseOrReport(InterestGroupMemberSchema, member))
    },
    async getAllByMember(handle, userId) {
      const groups = await handle.interestGroup.findMany({ where: { members: { some: { userId } } } })
      return groups.map((group) => parseOrReport(InterestGroupSchema, group))
    },
    async addMember(handle, interestGroupId, userId) {
      const member = await handle.interestGroupMember.create({ data: { interestGroupId, userId } })
      return parseOrReport(InterestGroupMemberSchema, member)
    },
    async removeMember(handle, interestGroupId, userId) {
      await handle.interestGroupMember.delete({ where: { interestGroupId_userId: { interestGroupId, userId } } })
    },
    async getAllByEventId(handle, eventId) {
      const groups = await handle.interestGroup.findMany({
        where: {
          events: {
            some: { eventId },
          },
        },
      })
      return groups.map((group) => parseOrReport(InterestGroupSchema, group))
    },
  }
}
