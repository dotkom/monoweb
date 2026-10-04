import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { createS3PresignedPost, slugify } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { UserId } from "../user/user"
import type {
  InterestGroupEventFilterQuery,
  InterestGroupEventId,
  InterestGroupEventRegistration,
  InterestGroupEventRegistrationId,
  InterestGroupEventSummary,
  InterestGroupEventWrite,
} from "./interest-group-event"
import { INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB } from "./interest-group-event"
import type { InterestGroupEventRepository } from "./interest-group-event-repository"

export interface InterestGroupEventService {
  create(handle: DBHandle, data: InterestGroupEventWrite): Promise<InterestGroupEventSummary>
  update(
    handle: DBHandle,
    id: InterestGroupEventId,
    data: Partial<InterestGroupEventWrite>
  ): Promise<InterestGroupEventSummary>
  findById(handle: DBHandle, id: InterestGroupEventId, includeUsers: boolean): Promise<InterestGroupEventSummary | null>
  getById(handle: DBHandle, id: InterestGroupEventId, includeUsers: boolean): Promise<InterestGroupEventSummary>
  findMany(
    handle: DBHandle,
    query: InterestGroupEventFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummary[]>

  createRegistration(
    handle: DBHandle,
    interestGroupEventId: InterestGroupEventId,
    userId: UserId
  ): Promise<InterestGroupEventRegistration>
  deleteRegistration(handle: DBHandle, interestGroupEventId: InterestGroupEventId, userId: UserId): Promise<void>
  findRegistrationById(
    handle: DBHandle,
    id: InterestGroupEventRegistrationId
  ): Promise<InterestGroupEventRegistration | null>
  findRegistrations(
    handle: DBHandle,
    interestGroupEventId: InterestGroupEventId
  ): Promise<InterestGroupEventRegistration[]>

  createFileUpload(filename: string, contentType: string, createdByUserId: UserId): Promise<PresignedPost>
}

export function getInterestGroupEventService(
  interestGroupEventRepository: InterestGroupEventRepository,
  s3Client: S3Client,
  s3BucketName: string
): InterestGroupEventService {
  return {
    async create(handle, data) {
      return interestGroupEventRepository.create(handle, data)
    },

    async update(handle, id, data) {
      return interestGroupEventRepository.update(handle, id, data)
    },

    async findById(handle, id, includeUsers) {
      return interestGroupEventRepository.findById(handle, id, includeUsers)
    },

    async getById(handle, id, includeUsers) {
      const interestGroupEvent = await interestGroupEventRepository.findById(handle, id, includeUsers)
      if (interestGroupEvent === null) {
        throw new NotFoundError(`InterestGroupEvent(ID=${id}) not found`)
      }

      return interestGroupEvent
    },

    async findMany(handle, query, page, includeUsers) {
      return interestGroupEventRepository.findMany(handle, query, page, includeUsers)
    },

    async createRegistration(handle, interestGroupEventId, userId) {
      return interestGroupEventRepository.createRegistration(handle, interestGroupEventId, userId)
    },

    async deleteRegistration(handle, interestGroupEventId, userId) {
      return interestGroupEventRepository.deleteRegistration(handle, interestGroupEventId, userId)
    },

    async findRegistrationById(handle, id) {
      return interestGroupEventRepository.findRegistrationById(handle, id)
    },

    async findRegistrations(handle, interestGroupEventId) {
      return interestGroupEventRepository.findRegistrations(handle, interestGroupEventId)
    },

    async createFileUpload(filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `interest-group-event/${Date.now()}-${uuid}-${slugify(filename)}`

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB: INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB,
        contentType,
        createdByUserId,
      })
    },
  }
}
