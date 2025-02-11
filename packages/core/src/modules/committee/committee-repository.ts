import { type Committee, type CommitteeId, CommitteeSchema, type CommitteeWrite } from "@dotkomonline/types"
import { Pageable } from "../../query"
import { DBClient } from "@dotkomonline/db"

export interface CommitteeRepository {
  create(values: CommitteeWrite): Promise<Committee>
  getById(id: CommitteeId): Promise<Committee | null>
  getAll(): Promise<Committee[]>
  getAllIds(): Promise<CommitteeId[]>
}

export class CommitteeRepositoryImpl implements CommitteeRepository {
  constructor(private readonly db: DBClient) {}

  async getById(id: CommitteeId) {
    return await this.db.committee.findUnique({ where: { id }})
  }

  async getAll() {
    return await this.db.committee.findMany({})
  }

  async create(data: CommitteeWrite) {
    return await this.db.committee.create({ data })
  }

  async getAllIds() {
    return (await this.db.committee.findMany({ select: { id: true }})).map(commitee => commitee.id)
  }
}
