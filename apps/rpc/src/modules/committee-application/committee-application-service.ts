import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type {
  CommitteeApplication,
  CommitteeApplicationId,
  CommitteeApplicationPeriodSummary,
  CommitteeApplicationWrite,
} from "./committee-application"
import type { CommitteeApplicationRepository } from "./committee-application-repository"

export interface CommitteeApplicationService {
  create(handle: DBHandle, data: CommitteeApplicationWrite): Promise<CommitteeApplication>
  update(
    handle: DBHandle,
    committeeApplicationId: CommitteeApplicationId,
    data: Partial<CommitteeApplicationWrite>
  ): Promise<CommitteeApplication>
  delete(handle: DBHandle, committeeApplicationId: CommitteeApplicationId): Promise<void>
  getById(handle: DBHandle, committeeApplicationId: CommitteeApplicationId): Promise<CommitteeApplication>
  findById(handle: DBHandle, committeeApplicationId: CommitteeApplicationId): Promise<CommitteeApplication | null>
  findMany(handle: DBHandle, page: Pageable): Promise<CommitteeApplication[]>
  findOpenPeriod(handle: DBHandle): Promise<CommitteeApplicationPeriodSummary | null>
}

export function getCommitteeApplicationService(
  committeeApplicationRepository: CommitteeApplicationRepository
): CommitteeApplicationService {
  return {
    async create(handle, data) {
      return await committeeApplicationRepository.create(handle, data)
    },

    async update(handle, committeeApplicationId, data) {
      await this.getById(handle, committeeApplicationId)

      return await committeeApplicationRepository.update(handle, committeeApplicationId, data)
    },

    async delete(handle, committeeApplicationId) {
      await this.getById(handle, committeeApplicationId)

      await committeeApplicationRepository.delete(handle, committeeApplicationId)
    },

    async getById(handle, committeeApplicationId) {
      const committeeApplication = await committeeApplicationRepository.findById(handle, committeeApplicationId)

      if (committeeApplication === null) {
        throw new NotFoundError(`CommitteeApplication(ID=${committeeApplicationId}) not found`)
      }

      return committeeApplication
    },

    async findById(handle, committeeApplicationId) {
      return await committeeApplicationRepository.findById(handle, committeeApplicationId)
    },

    async findMany(handle, page) {
      return await committeeApplicationRepository.findMany(handle, page)
    },

    async findOpenPeriod(handle) {
      return await committeeApplicationRepository.findOpenPeriod(handle, new Date())
    },
  }
}
