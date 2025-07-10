import type { DBHandle } from "@dotkomonline/db"
import type {
  EventId,
  InterestGroup,
  InterestGroupId,
  InterestGroupMember,
  InterestGroupWrite,
  UserId,
} from "@dotkomonline/types"
import { InterestGroupNotFoundError } from "./interest-group-error"
import type { InterestGroupRepository } from "./interest-group-repository"

export interface InterestGroupService {
  getById(handle: DBHandle, interestGroupId: InterestGroupId): Promise<InterestGroup>
  getAll(handle: DBHandle): Promise<InterestGroup[]>
  create(handle: DBHandle, values: InterestGroupWrite): Promise<InterestGroup>
  update(
    handle: DBHandle,
    interestGroupId: InterestGroupId,
    values: Partial<InterestGroupWrite>
  ): Promise<InterestGroup>
  delete(handle: DBHandle, interestGroupId: InterestGroupId): Promise<void>
  getMembers(handle: DBHandle, interestGroupId: InterestGroupId): Promise<InterestGroupMember[]>
  getByMember(handle: DBHandle, userId: UserId): Promise<InterestGroup[]>
  addMember(handle: DBHandle, interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(handle: DBHandle, interestGroupId: InterestGroupId, userId: UserId): Promise<void>
  getAllByEventId(handle: DBHandle, eventId: EventId): Promise<InterestGroup[]>
}

export function getInterestGroupService(interestGroupRepository: InterestGroupRepository): InterestGroupService {
  return {
    async getById(handle: DBHandle, interestGroupId: InterestGroupId) {
      const interestGroup = await interestGroupRepository.getById(handle, interestGroupId)
      if (!interestGroup) {
        throw new InterestGroupNotFoundError(interestGroupId)
      }
      return interestGroup
    },
    async getAll(handle) {
      return interestGroupRepository.getAll(handle)
    },
    async getAllByEventId(handle, eventId) {
      return interestGroupRepository.getAllByEventId(handle, eventId)
    },
    async create(handle, values) {
      return interestGroupRepository.create(handle, values)
    },
    async update(handle, interestGroupId, values) {
      return interestGroupRepository.update(handle, interestGroupId, values)
    },
    async delete(handle, interestGroupId) {
      return interestGroupRepository.delete(handle, interestGroupId)
    },
    async getMembers(handle, interestGroupId) {
      return interestGroupRepository.getAllMembers(handle, interestGroupId)
    },
    async getByMember(handle, userId) {
      return interestGroupRepository.getAllByMember(handle, userId)
    },
    async addMember(handle, interestGroupId, userId) {
      return interestGroupRepository.addMember(handle, interestGroupId, userId)
    },
    async removeMember(handle, interestGroupId, userId) {
      return interestGroupRepository.removeMember(handle, interestGroupId, userId)
    },
  }
}
