import type { Committee, CommitteeId, CommitteeWrite } from "@dotkomonline/types"
import { CommitteeNotFoundError } from "./committee-error"
import type { CommitteeRepository } from "./committee-repository"

export interface CommitteeService {
  getCommittee(id: CommitteeId): Promise<Committee>
  getCommittees(): Promise<Committee[]>
  createCommittee(payload: CommitteeWrite): Promise<Committee>
  getAllCommitteeIds(): Promise<CommitteeId[]>
}

export class CommitteeServiceImpl implements CommitteeService {
  constructor(private readonly committeeRepository: CommitteeRepository) {}

  /**
   * Get a committee by its id
   *
   * @throws {CommitteeNotFoundError} if the committee does not exist
   */
  async getCommittee(id: CommitteeId) {
    const committee = await this.committeeRepository.getById(id)
    if (!committee) {
      throw new CommitteeNotFoundError(id)
    }
    return committee
  }

  async createCommittee(payload: CommitteeWrite) {
    return await this.committeeRepository.create(payload)
  }

  async getCommittees() {
    return this.committeeRepository.getAll()
  }

  async getAllCommitteeIds() {
    return this.committeeRepository.getAllIds()
  }
}
