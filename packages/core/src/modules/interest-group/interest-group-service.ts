import type {
  InterestGroup,
  InterestGroupId,
  InterestGroupMember,
  InterestGroupWrite,
  UserId,
} from "@dotkomonline/types"
import type { Collection, Pageable } from "../../query"
import type { InterestGroupRepository } from "./interest-group-repository"

export interface InterestGroupService {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(pageable: Pageable): Promise<Collection<InterestGroup>>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: InterestGroupWrite): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
  getMembers(id: InterestGroupId): Promise<InterestGroupMember[]>
  getByMember(userId: UserId): Promise<InterestGroup[]>
  addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void>
}

export class InterestGroupServiceImpl implements InterestGroupService {
  constructor(private readonly interestGroupRepository: InterestGroupRepository) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    return this.interestGroupRepository.getById(id)
  }

  async getAll(pageable: Pageable): Promise<Collection<InterestGroup>> {
    return this.interestGroupRepository.getAll(pageable)
  }

  async create(values: InterestGroupWrite): Promise<InterestGroup> {
    return this.interestGroupRepository.create(values)
  }

  async update(id: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup> {
    return this.interestGroupRepository.update(id, values)
  }

  async delete(id: InterestGroupId): Promise<void> {
    return this.interestGroupRepository.delete(id)
  }

  async getMembers(id: InterestGroupId): Promise<InterestGroupMember[]> {
    return this.interestGroupRepository.getAllMembers(id)
  }

  async getByMember(userId: UserId): Promise<InterestGroup[]> {
    return this.interestGroupRepository.getAllByMember(userId)
  }

  async addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember> {
    return this.interestGroupRepository.addMember(interestGroupId, userId)
  }

  async removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void> {
    this.interestGroupRepository.removeMember(interestGroupId, userId)
  }
}
