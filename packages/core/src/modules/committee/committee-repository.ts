import type { DBClient } from "@dotkomonline/db"
import type { Committee, CommitteeId, CommitteeWrite } from "@dotkomonline/types"

export interface CommitteeRepository {
  create(values: CommitteeWrite): Promise<Committee>
  getById(id: CommitteeId): Promise<Committee | null>
  getAll(): Promise<Committee[]>
  getAllIds(): Promise<CommitteeId[]>
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getById(id: CommitteeId) {
    return await this.db.committee.findUnique({ where: { id } })
  }

  async getAll() {
    return await this.db.committee.findMany({})
  }

  async create(data: CommitteeWrite) {
    return await this.db.committee.create({ data })
  }

  async getAllIds() {
    return (await this.db.committee.findMany({ select: { id: true } })).map((commitee) => commitee.id)
  }
}
