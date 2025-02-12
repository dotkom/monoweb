import type { DBClient } from "@dotkomonline/db"
import type { Mark, MarkId, PersonalMark, UserId } from "@dotkomonline/types"

export interface PersonalMarkRepository {
  getByMarkId(markId: MarkId, take: number): Promise<PersonalMark[]>
  getAllByUserId(userId: UserId, take: number): Promise<PersonalMark[]>
  getAllMarksByUserId(userId: UserId, take: number): Promise<Mark[]>
  addToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark>
  removeFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  getByUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | null>
  countUsersByMarkId(markId: MarkId): Promise<number>
}

export class PersonalMarkRepositoryImpl implements PersonalMarkRepository {
  constructor(private readonly db: DBClient) {}

  async getAllByUserId(userId: UserId, take: number): Promise<PersonalMark[]> {
    return await this.db.personalMark.findMany({ where: { userId }, take })
  }

  async getAllMarksByUserId(userId: UserId, take: number): Promise<Mark[]> {
    const personalMarks = await this.db.personalMark.findMany({ where: { userId }, take, select: { mark: true } })

    return personalMarks.map((personalMark) => personalMark.mark)
  }

  async getByMarkId(markId: MarkId, take: number): Promise<PersonalMark[]> {
    return await this.db.personalMark.findMany({ where: { markId }, take })
  }

  async addToUserId(userId: UserId, markId: MarkId): Promise<PersonalMark> {
    return await this.db.personalMark.create({ data: { userId, markId } })
  }

  async removeFromUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | null> {
    return await this.db.personalMark.delete({ where: { markId_userId: { userId, markId } } })
  }

  async getByUserId(userId: UserId, markId: MarkId): Promise<PersonalMark | null> {
    return await this.db.personalMark.findUnique({ where: { markId_userId: { userId, markId } } })
  }

  async countUsersByMarkId(markId: MarkId): Promise<number> {
    return await this.db.personalMark.count({ where: { markId } })
  }
}
