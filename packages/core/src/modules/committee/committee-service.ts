import { type Committee, type CommitteeId, type CommitteeWrite } from "@dotkomonline/types"
import { type CommitteeRepository } from "./committee-repository"
import { type Collection, type Pageable } from "../../utils/db-utils"
import { CommitteeNotFoundError } from "./committee-error"

export interface CommitteeService {
  getCommittee(id: CommitteeId): Promise<Committee>
  getCommittees(pageable: Pageable): Promise<Collection<Committee>>
  createCommittee(payload: CommitteeWrite): Promise<Committee>
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
}
