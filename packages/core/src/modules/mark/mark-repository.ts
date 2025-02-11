import { DBClient } from "@dotkomonline/db"
import { type Mark, type MarkId, MarkSchema, type MarkWrite } from "@dotkomonline/types"
export interface MarkRepository {
  getById(id: MarkId): Promise<Mark | null>
  getAll(take: number): Promise<Mark[]>
  create(markInsert: MarkWrite): Promise<Mark>
  update(id: MarkId, markUpdate: MarkWrite): Promise<Mark | null>
  delete(id: MarkId): Promise<Mark | null>
}

export class MarkRepositoryImpl implements MarkRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: MarkId): Promise<Mark | null> {
    return await this.db.mark.findUnique({ where: { id } })
  }

  async getAll(take: number): Promise<Mark[]> {
    return await this.db.mark.findMany({ take })
  }

  async create(data: MarkWrite): Promise<Mark> {
    return await this.db.mark.create({ data })
  }

  async update(id: MarkId, data: MarkWrite): Promise<Mark | null> {
    return await this.db.mark.update({ where: { id }, data })
  }

  async delete(id: MarkId): Promise<Mark | null> {
    return await this.db.mark.delete({ where: { id }})
  }
}
