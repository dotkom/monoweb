import type { DBClient } from "@dotkomonline/db"
import type { Mark, MarkId, MarkWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface MarkRepository {
  getById(markId: MarkId): Promise<Mark | null>
  getAll(page: Pageable): Promise<Mark[]>
  create(data: MarkWrite): Promise<Mark>
  update(markId: MarkId, data: MarkWrite): Promise<Mark>
  delete(markId: MarkId): Promise<Mark>
}

export class MarkRepositoryImpl implements MarkRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getById(markId: MarkId) {
    return await this.db.mark.findUnique({ where: { id: markId } })
  }

  public async getAll(page: Pageable) {
    return await this.db.mark.findMany({ ...pageQuery(page) })
  }

  public async create(data: MarkWrite) {
    return await this.db.mark.create({ data })
  }

  public async update(markId: MarkId, data: MarkWrite) {
    return await this.db.mark.update({ where: { id: markId }, data })
  }

  public async delete(markId: MarkId) {
    return await this.db.mark.delete({ where: { id: markId } })
  }
}
