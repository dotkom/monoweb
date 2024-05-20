import type { Committee, CommitteeId, CommitteeWrite } from "@dotkomonline/types"
import type { Pageable, PaginatedResult } from "../../utils/cursor-pagination/types"
import { CommitteeNotFoundError } from "./committee-error"
import type { CommitteeRepository } from "./committee-repository"

export interface CommitteeService {
  getCommittee(id: CommitteeId): Promise<Committee>
  getCommittees(pageable: Pageable): Promise<PaginatedResult<Committee>>
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

  async getCommittees(pageable: Pageable) {
    return this.committeeRepository.getAll(pageable)
  }

  async getAllCommitteeIds() {
    return this.committeeRepository.getAllIds()
  }
}
