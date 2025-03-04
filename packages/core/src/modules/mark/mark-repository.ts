import type { DBClient } from "@dotkomonline/db"
import type { Mark, MarkId, MarkWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"
export interface MarkRepository {
  getById(id: MarkId): Promise<Mark | null>
  getAll(page: Pageable): Promise<Mark[]>
  create(markInsert: MarkWrite): Promise<Mark>
  update(id: MarkId, markUpdate: MarkWrite): Promise<Mark | null>
  delete(id: MarkId): Promise<Mark | null>
}

export class MarkRepositoryImpl implements MarkRepository {
  constructor(private readonly db: DBClient) {}

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
}
