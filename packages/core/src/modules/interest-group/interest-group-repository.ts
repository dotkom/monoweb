import type { DBClient } from "@dotkomonline/db"
import {
  type InterestGroup,
  type InterestGroupId,
  type InterestGroupWrite,
} from "@dotkomonline/types"

export interface InterestGroupRepository {
  getById(id: InterestGroupId): Promise<InterestGroup | null>
  getAll(): Promise<InterestGroup[]>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(id: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup>
  delete(id: InterestGroupId): Promise<void>
}

export class InterestGroupRepositoryImpl implements InterestGroupRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: InterestGroupId): Promise<InterestGroup | null> {
    return await this.db.interestGroup.findUnique({ where: { id }})
  }

  async getAll(): Promise<InterestGroup[]> {
    return await this.db.interestGroup.findMany({})
  }

  async create(data: InterestGroupWrite): Promise<InterestGroup> {
    return await this.db.interestGroup.create({ data })
  }

  async update(id: InterestGroupId, data: Partial<InterestGroupWrite>): Promise<InterestGroup> {
    return await this.db.interestGroup.update({ where: { id }, data })
  }

  async delete(id: InterestGroupId): Promise<void> {
    await this.db.interestGroup.delete({ where: { id } })
  }
}
