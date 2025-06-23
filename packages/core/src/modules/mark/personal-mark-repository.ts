import type { DBClient } from "@dotkomonline/db"
import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"

export interface PersonalMarkRepository {
  getByMarkId(markId: MarkId): Promise<PersonalMark[]>
  getAllByUserId(userId: UserId): Promise<PersonalMark[]>
  getAllMarksByUserId(userId: UserId): Promise<Mark[]>
  addToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  removeFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  getByUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  countUsersByMarkId(markId: MarkId): Promise<number>
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getAllByUserId(userId: UserId) {
    return await this.db.personalMark.findMany({ where: { userId } })
  }

  public async getAllMarksByUserId(userId: UserId) {
    const personalMarks = await this.db.personalMark.findMany({ where: { userId }, select: { mark: true } })

    return personalMarks.map((personalMark) => personalMark.mark)
  }

  public async getByMarkId(markId: MarkId) {
    return await this.db.personalMark.findMany({ where: { markId } })
  }

  public async addToUserId(userId: UserId, markId: MarkId) {
    return await this.db.personalMark.create({ data: { userId, markId } })
  }

  public async removeFromUserId(userId: UserId, markId: MarkId) {
    return await this.db.personalMark.delete({ where: { markId_userId: { userId, markId } } })
  }

  public async getByUserId(userId: UserId, markId: MarkId) {
    return await this.db.personalMark.findUnique({ where: { markId_userId: { userId, markId } } })
  }

  public async countUsersByMarkId(markId: MarkId) {
    return await this.db.personalMark.count({ where: { markId } })
  }
}
