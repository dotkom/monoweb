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
  getById(interestGroupId: InterestGroupId): Promise<InterestGroup>
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

  public async getById(interestGroupId: InterestGroupId) {
    const interestGroup = await this.interestGroupRepository.getById(interestGroupId)

    if (!interestGroup) {
      throw new InterestGroupNotFoundError(interestGroupId)
    }

    return interestGroup
  }

  public async getAll() {
    return this.interestGroupRepository.getAll()
  }

  public async getAllByEventId(eventId: EventId) {
    return this.interestGroupRepository.getAllByEventId(eventId)
  }

  public async create(values: InterestGroupWrite) {
    return this.interestGroupRepository.create(values)
  }

  public async update(interestGroupId: InterestGroupId, values: Partial<InterestGroupWrite>) {
    return this.interestGroupRepository.update(interestGroupId, values)
  }

  public async delete(interestGroupId: InterestGroupId) {
    return this.interestGroupRepository.delete(interestGroupId)
  }

  public async getMembers(interestGroupId: InterestGroupId) {
    return this.interestGroupRepository.getAllMembers(interestGroupId)
  }

  public async getByMember(userId: UserId) {
    return this.interestGroupRepository.getAllByMember(userId)
  }

  public async addMember(interestGroupId: InterestGroupId, userId: UserId) {
    return this.interestGroupRepository.addMember(interestGroupId, userId)
  }

  public async removeMember(interestGroupId: InterestGroupId, userId: UserId) {
    return this.interestGroupRepository.removeMember(interestGroupId, userId)
  }
}
