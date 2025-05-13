import type { DBClient } from "@dotkomonline/db"
import type { Mark, MarkId, MarkWrite, UserId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"
export interface MarkRepository {
  getById(id: MarkId): Promise<Mark | null>
  getAll(page: Pageable): Promise<Mark[]>
  create(markInsert: MarkWrite): Promise<Mark>
  update(id: MarkId, markUpdate: MarkWrite): Promise<Mark | null>
  delete(id: MarkId): Promise<Mark | null>
  getActiveMarksByUserId(userId: UserId): Promise<Mark[]>
}

export class MarkRepositoryImpl implements MarkRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getById(id: MarkId): Promise<Mark | null> {
    return await this.db.mark.findUnique({ where: { id } })
  }

  async getAll(page: Pageable): Promise<Mark[]> {
    return await this.db.mark.findMany({ ...pageQuery(page) })
  }

  async create(data: MarkWrite): Promise<Mark> {
    return await this.db.mark.create({ data })
  }

  async update(id: MarkId, data: MarkWrite): Promise<Mark | null> {
    return await this.db.mark.update({ where: { id }, data })
  }

  async delete(id: MarkId): Promise<Mark | null> {
    return await this.db.mark.delete({ where: { id } })
  }

  async getActiveMarksByUserId(userId: UserId): Promise<Mark[]> {
    return await this.db.mark.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
        expiresAt: {
          gte: new Date(),
        },
      },
    })
  }
}
