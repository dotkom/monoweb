import { InterestGroup, InterestGroupId, InterestGroupWrite } from "@dotkomonline/types"
import { InterestGroupRepository } from "./interest-group-repository"
import { Cursor } from "../../utils/db-utils"

export interface InterestGroupService {
  getById(id: InterestGroupId): Promise<InterestGroup | undefined>
  getAll(take: number, cursor?: Cursor): Promise<InterestGroup[]>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: InterestGroupWrite): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
}

export class InterestGroupServiceImpl implements InterestGroupService {
  constructor(private readonly interestGroupRepository: InterestGroupRepository) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | undefined> {
    return this.interestGroupRepository.getById(id)
  }

  async getAll(take: number, cursor?: Cursor): Promise<InterestGroup[]> {
    return this.interestGroupRepository.getAll(take, cursor)
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
