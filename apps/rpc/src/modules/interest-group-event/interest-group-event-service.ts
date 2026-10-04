import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { createS3PresignedPost, slugify } from "@dotkomonline/utils"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import type { GroupService } from "../group/group-service"
import type { UserId } from "../user/user"
import type {
  InterestGroupEventFilterQuery,
  InterestGroupEventId,
  InterestGroupEventRegistration,
  InterestGroupEventRegistrationId,
  InterestGroupEventSummary,
  InterestGroupEventWrite,
} from "./interest-group-event"
import {
  INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB,
  isInterestGroupEventDeregistrationOpen,
  isInterestGroupEventEnded,
  isInterestGroupEventRegistrationOpen,
} from "./interest-group-event"
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
  groupService: GroupService,
  s3Client: S3Client,
  s3BucketName: string
): InterestGroupEventService {
  return {
    async create(handle, data) {
      const capacity = data.capacity === 0 ? null : data.capacity

      const interestGroup = await groupService.getBySlug(handle, data.interestGroupId)
      if (interestGroup.type !== "INTEREST_GROUP") {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      return interestGroupEventRepository.create(handle, { ...data, capacity })
    },

    async update(handle, id, data) {
      const interestGroup = data.interestGroupId ? await groupService.getBySlug(handle, data.interestGroupId) : null
      if (interestGroup !== null && interestGroup.type !== "INTEREST_GROUP") {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const capacity = data.capacity === 0 ? null : data.capacity

      return interestGroupEventRepository.update(handle, id, { ...data, capacity })
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
      const interestGroupEvent = await this.getById(handle, interestGroupEventId, false)
      if (isInterestGroupEventEnded(interestGroupEvent)) {
        throw new FailedPreconditionError(
          `Cannot register for InterestGroupEvent(ID=${interestGroupEventId}) after it has ended`
        )
      }

      if (!isInterestGroupEventRegistrationOpen(interestGroupEvent)) {
        throw new FailedPreconditionError(
          `Cannot register for InterestGroupEvent(ID=${interestGroupEventId}) after registerEnd`
        )
      }

      return interestGroupEventRepository.createRegistration(handle, interestGroupEventId, userId)
    },

    async deleteRegistration(handle, interestGroupEventId, userId) {
      const interestGroupEvent = await this.getById(handle, interestGroupEventId, false)
      if (!isInterestGroupEventDeregistrationOpen(interestGroupEvent)) {
        throw new FailedPreconditionError(
          `Cannot deregister from InterestGroupEvent(ID=${interestGroupEventId}) after deregisterDeadline`
        )
      }

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
