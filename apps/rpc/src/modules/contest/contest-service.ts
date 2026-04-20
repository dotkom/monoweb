import type { DBHandle } from "@dotkomonline/db"
import type { Contest, ContestId, Contestant, ContestantDetail, ContestantId, ContestWrite } from "@dotkomonline/types"
import { InvalidArgumentError, NotFoundError } from "../../error"
import type { Pageable } from "@dotkomonline/utils"
import type { ContestRepository } from "./contest-repository"

export interface ContestService {
  findById(handle: DBHandle, contestId: ContestId): Promise<Contest | null>
  getById(handle: DBHandle, contestId: ContestId): Promise<Contest>
  getContestantById(handle: DBHandle, contestantId: ContestantId): Promise<Contestant>
  findMany(handle: DBHandle, page: Pageable): Promise<Contest[]>
  create(handle: DBHandle, data: ContestWrite): Promise<Contest>
  update(handle: DBHandle, contestId: ContestId, data: Partial<ContestWrite>): Promise<Contest>
  delete(handle: DBHandle, contestId: ContestId): Promise<void>
  setWinner(handle: DBHandle, contestId: ContestId, contestantId: ContestantId | null): Promise<Contest>
  addUserContestant(handle: DBHandle, contestId: ContestId, userId: string): Promise<Contestant>
  addTeamContestant(handle: DBHandle, contestId: ContestId, teamName: string, memberIds: string[]): Promise<Contestant>
  updateContestantResult(handle: DBHandle, contestantId: ContestantId, resultValue: number | null): Promise<Contestant>
  removeContestant(handle: DBHandle, contestantId: ContestantId): Promise<void>
  getContestWithContestants(
    handle: DBHandle,
    contestId: ContestId
  ): Promise<{ contest: Contest; contestants: ContestantDetail[] }>
}

export function getContestService(contestRepository: ContestRepository): ContestService {
  return {
    async findById(handle, contestId) {
      return await contestRepository.findById(handle, contestId)
    },

    async getById(handle, contestId) {
      const contest = await this.findById(handle, contestId)
      if (!contest) {
        throw new NotFoundError(`Contest(ID=${contestId}) not found`)
      }
      return contest
    },

    async getContestantById(handle, contestantId) {
      const contestant = await contestRepository.findContestantById(handle, contestantId)
      if (!contestant) {
        throw new NotFoundError(`Contestant(ID=${contestantId}) not found`)
      }
      return contestant
    },

    async findMany(handle, page) {
      return await contestRepository.findMany(handle, page)
    },

    async create(handle, data) {
      return await contestRepository.create(handle, data)
    },

    async update(handle, contestId, data) {
      return await contestRepository.update(handle, contestId, data)
    },

    async delete(handle, contestId) {
      await this.getById(handle, contestId)
      await contestRepository.delete(handle, contestId)
    },

    async setWinner(handle, contestId, contestantId) {
      if (contestantId !== null) {
        const contestant = await contestRepository.findContestantById(handle, contestantId)
        if (contestant?.contestId !== contestId) {
          throw new InvalidArgumentError(`Contestant(ID=${contestantId}) does not belong to Contest(ID=${contestId})`)
        }
      }
      return await contestRepository.setWinner(handle, contestId, contestantId)
    },

    async addUserContestant(handle, contestId, userId) {
      return await contestRepository.createContestant(handle, { contestId, userId, resultValue: null })
    },

    async addTeamContestant(handle, contestId, teamName, memberIds) {
      const contestant = await contestRepository.createContestant(handle, {
        contestId,
        userId: null,
        resultValue: null,
      })
      await contestRepository.createTeam(handle, contestant.id, teamName, memberIds)
      return contestant
    },

    async updateContestantResult(handle, contestantId, resultValue) {
      return await contestRepository.updateContestant(handle, contestantId, { resultValue })
    },

    async removeContestant(handle, contestantId) {
      await contestRepository.deleteContestant(handle, contestantId)
    },

    async getContestWithContestants(handle, contestId) {
      const contest = await this.getById(handle, contestId)
      const contestants = await contestRepository.findContestantsWithDetailsByContestId(handle, contestId)
      return { contest, contestants }
    },
  }
}
