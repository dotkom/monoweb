import type {
  EventId,
  InterestGroup,
  InterestGroupId,
  InterestGroupMember,
  InterestGroupWrite,
  UserId,
} from "@dotkomonline/types"
import type { InterestGroupRepository } from "./interest-group-repository"

export interface InterestGroupService {
  getById(interestGroupId: InterestGroupId): Promise<InterestGroup | null>
  getAll(): Promise<InterestGroup[]>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(interestGroupId: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup>
  delete(interestGroupId: InterestGroupId): Promise<void>
  getMembers(interestGroupId: InterestGroupId): Promise<InterestGroupMember[]>
  getByMember(userId: UserId): Promise<InterestGroup[]>
  addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void>
  getAllByEventId(eventId: EventId): Promise<InterestGroup[]>
}

export class InterestGroupServiceImpl implements InterestGroupService {
  private readonly interestGroupRepository: InterestGroupRepository

  constructor(interestGroupRepository: InterestGroupRepository) {
    this.interestGroupRepository = interestGroupRepository
  }

  async getById(interestGroupId: InterestGroupId) {
    return this.interestGroupRepository.getById(interestGroupId)
  }

  async getAll() {
    return this.interestGroupRepository.getAll()
  }

  async getAllByEventId(eventId: EventId) {
    return this.interestGroupRepository.getAllByEventId(eventId)
  }

  async create(values: InterestGroupWrite) {
    return this.interestGroupRepository.create(values)
  }

  async update(interestGroupId: InterestGroupId, values: Partial<InterestGroupWrite>) {
    return this.interestGroupRepository.update(interestGroupId, values)
  }

  async delete(interestGroupId: InterestGroupId) {
    return this.interestGroupRepository.delete(interestGroupId)
  }

  async getMembers(interestGroupId: InterestGroupId) {
    return this.interestGroupRepository.getAllMembers(interestGroupId)
  }

  async getByMember(userId: UserId) {
    return this.interestGroupRepository.getAllByMember(userId)
  }

  async addMember(interestGroupId: InterestGroupId, userId: UserId) {
    return this.interestGroupRepository.addMember(interestGroupId, userId)
  }

  async removeMember(interestGroupId: InterestGroupId, userId: UserId) {
    return this.interestGroupRepository.removeMember(interestGroupId, userId)
  }
}
