import { type Committee, type CommitteeId, type CommitteeWrite } from "@dotkomonline/types"
import { type CommitteeRepository } from "./committee-repository"
import { NotFoundError } from "../../errors/errors"
import { type Cursor } from "../../utils/db-utils"

export interface CommitteeService {
  getCommittee(id: CommitteeId): Promise<Committee>
  getCommittees(take: number, cursor?: Cursor): Promise<Committee[]>
  createCommittee(payload: CommitteeWrite): Promise<Committee>
}

export class CommitteeServiceImpl implements CommitteeService {
  constructor(private readonly committeeRepository: CommitteeRepository) {}

  async getCommittee(id: CommitteeId) {
    const committee = await this.committeeRepository.getById(id)
    if (!committee) {
      throw new NotFoundError(`Company with ID:${id} not found`)
    }
    return committee
  }

  async createCommittee(payload: CommitteeWrite) {
    return await this.committeeRepository.create(payload)
  }

  async getCommittees(take: number, cursor?: Cursor) {
    return this.committeeRepository.getAll(take, cursor)
  }
}
