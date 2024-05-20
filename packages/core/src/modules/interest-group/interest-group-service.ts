import type { InterestGroup, InterestGroupId, InterestGroupWrite } from "@dotkomonline/types"
import type { Pageable, PaginatedResult } from "../../utils/cursor-pagination/types"
import type { InterestGroupRepository } from "./interest-group-repository"

export interface InterestGroupService {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(pageable: Pageable): Promise<PaginatedResult<InterestGroup>>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: InterestGroupWrite): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
}

export class InterestGroupServiceImpl implements InterestGroupService {
  constructor(private readonly interestGroupRepository: InterestGroupRepository) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    return this.interestGroupRepository.getById(id)
  }

  async getAll(pageable: Pageable): Promise<PaginatedResult<InterestGroup>> {
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
}
