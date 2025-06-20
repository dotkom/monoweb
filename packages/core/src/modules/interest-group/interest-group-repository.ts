import type { DBClient } from "@dotkomonline/db"
import type {
  EventId,
  InterestGroup,
  InterestGroupId,
  InterestGroupMember,
  InterestGroupWrite,
  UserId,
} from "@dotkomonline/types"

export interface InterestGroupRepository {
  getById(interestGroupId: InterestGroupId): Promise<InterestGroup | null>
  getAll(): Promise<InterestGroup[]>
  create(values: InterestGroupWrite): Promise<InterestGroup>
  update(interestGroupId: InterestGroupId, values: Partial<InterestGroupWrite>): Promise<InterestGroup>
  delete(interestGroupId: InterestGroupId): Promise<void>
  getAllMembers(interestGroupId: InterestGroupId): Promise<InterestGroupMember[]>
  getAllByMember(userId: UserId): Promise<InterestGroup[]>
  addMember(interestGroupId: InterestGroupId, userId: UserId): Promise<InterestGroupMember>
  removeMember(interestGroupId: InterestGroupId, userId: UserId): Promise<void>
  getAllByEventId(eventId: EventId): Promise<InterestGroup[]>
}

export class InterestGroupRepositoryImpl implements InterestGroupRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getById(interestGroupId: InterestGroupId) {
    return await this.db.interestGroup.findUnique({ where: { id: interestGroupId } })
  }

  public async getAll() {
    return await this.db.interestGroup.findMany()
  }

  public async create(data: InterestGroupWrite) {
    return await this.db.interestGroup.create({ data })
  }

  public async update(interestGroupId: InterestGroupId, data: Partial<InterestGroupWrite>) {
    return await this.db.interestGroup.update({ where: { id: interestGroupId }, data })
  }

  public async delete(interestGroupId: InterestGroupId) {
    await this.db.interestGroup.delete({ where: { id: interestGroupId } })
  }

  public async getAllMembers(interestGroupId: InterestGroupId) {
    return await this.db.interestGroupMember.findMany({ where: { interestGroupId } })
  }

  public async getAllByMember(userId: UserId) {
    return await this.db.interestGroup.findMany({ where: { members: { some: { userId } } } })
  }

  public async addMember(interestGroupId: InterestGroupId, userId: UserId) {
    return await this.db.interestGroupMember.create({ data: { interestGroupId, userId } })
  }

  public async removeMember(interestGroupId: InterestGroupId, userId: UserId) {
    await this.db.interestGroupMember.delete({ where: { interestGroupId, userId } })
  }

  public async getAllByEventId(eventId: EventId) {
    return await this.db.interestGroup.findMany({
      where: {
        events: {
          some: { eventId },
        },
      },
    })
  }
}
