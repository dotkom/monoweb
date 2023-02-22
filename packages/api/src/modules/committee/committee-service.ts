import { Committee, CommitteeWrite } from "@dotkomonline/types"
import { CommitteeRepository } from "./committee-repository"
import { NotFoundError } from "../../errors/errors"

export interface CommitteeService {
  getCommittee: (id: Committee["id"]) => Promise<Committee>
  getCommittees: (limit: number, offset?: number) => Promise<Committee[]>
  create: (payload: CommitteeWrite) => Promise<Committee>
}

export const initCommitteeService = (committeeRepository: CommitteeRepository): CommitteeService => ({
  getCommittee: async (id: Committee["id"]) => {
    const committee = await committeeRepository.getCommitteeById(id)
    if (!committee) throw new NotFoundError(`Company with ID:${id} not found`)
    return committee
  },
  create: async (payload: CommitteeWrite) => {
    return await committeeRepository.create(payload)
  },
  getCommittees: async (limit, offset = 0) => {
    return await committeeRepository.getCommittees(limit, offset)
  },
})
