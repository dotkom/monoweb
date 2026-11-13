import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { createS3PresignedPost, getCurrentUTC, slugify } from "@dotkomonline/utils"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import { GroupTypeSchema, type GroupId } from "../group/group"
import type { GroupService } from "../group/group-service"
import type { UserId } from "../user/user"
import type {
  RequestedSidequestWrite,
  SidequestFilterQuery,
  SidequestId,
  SidequestRegistration,
  SidequestRegistrationId,
  SidequestRequestId,
  SidequestRequestReviewWrite,
  SidequestRequestWrite,
  SidequestSummary,
  SidequestSummaryWithRequest,
  SidequestWrite,
} from "./sidequest"
import {
  SIDEQUEST_IMAGE_MAX_SIZE_KIB,
  SidequestStatusSchema,
  hasSidequestEnded,
  isSidequestDeregistrationOpen,
  isSidequestRegistrationOpen,
} from "./sidequest"
import type { SidequestRepository } from "./sidequest-repository"

export interface SidequestService {
  create(handle: DBHandle, data: SidequestWrite): Promise<SidequestSummary>
  update(handle: DBHandle, id: SidequestId, data: Partial<SidequestWrite>): Promise<SidequestSummary>
  findById(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummary | null>
  getById(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummary>
  getByIdWithRequest(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummaryWithRequest>
  findMany(
    handle: DBHandle,
    query: SidequestFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<SidequestSummary[]>
  findManyWithRequest(
    handle: DBHandle,
    query: SidequestFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest[]>

  createRegistration(handle: DBHandle, sidequestId: SidequestId, userId: UserId): Promise<SidequestRegistration>
  deleteRegistration(handle: DBHandle, sidequestId: SidequestId, userId: UserId): Promise<void>
  findRegistrationById(handle: DBHandle, id: SidequestRegistrationId): Promise<SidequestRegistration | null>
  findRegistrations(handle: DBHandle, sidequestId: SidequestId): Promise<SidequestRegistration[]>

  createFileUpload(filename: string, contentType: string, createdByUserId: UserId): Promise<PresignedPost>

  createRequest(
    handle: DBHandle,
    interestGroupId: GroupId,
    requestedById: UserId,
    sidequest: RequestedSidequestWrite,
    request: SidequestRequestWrite
  ): Promise<SidequestSummaryWithRequest>
  reviewRequest(
    handle: DBHandle,
    id: SidequestRequestId,
    reviewedById: UserId,
    review: SidequestRequestReviewWrite
  ): Promise<SidequestSummaryWithRequest>
}

export function getSidequestService(
  sidequestRepository: SidequestRepository,
  groupService: GroupService,
  s3Client: S3Client,
  s3BucketName: string
): SidequestService {
  return {
    async create(handle, data) {
      const capacity = data.capacity === 0 ? null : data.capacity

      const interestGroup = await groupService.getBySlug(handle, data.interestGroupId)
      if (interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      return sidequestRepository.create(handle, { ...data, capacity })
    },

    async update(handle, id, data) {
      const interestGroup =
        data.interestGroupId != null ? await groupService.getBySlug(handle, data.interestGroupId) : null
      if (interestGroup !== null && interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const capacity = data.capacity === 0 ? null : data.capacity

      return sidequestRepository.update(handle, id, { ...data, capacity })
    },

    async findById(handle, id, includeUsers) {
      return sidequestRepository.findById(handle, id, includeUsers)
    },

    async getById(handle, id, includeUsers) {
      const sidequest = await sidequestRepository.findById(handle, id, includeUsers)
      if (sidequest === null) {
        throw new NotFoundError(`Sidequest(ID=${id}) not found`)
      }

      return sidequest
    },

    async getByIdWithRequest(handle, id, includeUsers) {
      const sidequest = await sidequestRepository.findByIdWithRequest(handle, id, includeUsers)
      if (sidequest === null) {
        throw new NotFoundError(`Sidequest(ID=${id}) not found`)
      }

      return sidequest
    },

    async findMany(handle, query, page, includeUsers) {
      return sidequestRepository.findMany(handle, query, page, includeUsers)
    },

    async findManyWithRequest(handle, query, page, includeUsers) {
      return sidequestRepository.findManyWithRequest(handle, query, page, includeUsers)
    },

    async createRegistration(handle, sidequestId, userId) {
      const sidequest = await this.getById(handle, sidequestId, false)
      if (hasSidequestEnded(sidequest)) {
        throw new FailedPreconditionError(`Cannot register for Sidequest(ID=${sidequestId}) after it has ended`)
      }

      if (!isSidequestRegistrationOpen(sidequest)) {
        throw new FailedPreconditionError(`Cannot register for Sidequest(ID=${sidequestId}) after registerEnd`)
      }

      return sidequestRepository.createRegistration(handle, sidequestId, userId)
    },

    async deleteRegistration(handle, sidequestId, userId) {
      const sidequest = await this.getById(handle, sidequestId, false)
      if (!isSidequestDeregistrationOpen(sidequest)) {
        throw new FailedPreconditionError(
          `Cannot deregister from Sidequest(ID=${sidequestId}) after deregisterDeadline`
        )
      }

      return sidequestRepository.deleteRegistration(handle, sidequestId, userId)
    },

    async findRegistrationById(handle, id) {
      return sidequestRepository.findRegistrationById(handle, id)
    },

    async findRegistrations(handle, sidequestId) {
      return sidequestRepository.findRegistrations(handle, sidequestId)
    },

    async createFileUpload(filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `sidequest/${Date.now()}-${uuid}-${slugify(filename)}`

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB: SIDEQUEST_IMAGE_MAX_SIZE_KIB,
        contentType,
        createdByUserId,
      })
    },

    async createRequest(handle, interestGroupId, requestedById, sidequest, request) {
      const capacity = sidequest.capacity === 0 ? null : sidequest.capacity

      const createdSidequest = await this.create(handle, {
        ...sidequest,
        interestGroupId,
        status: SidequestStatusSchema.enum.IN_REVIEW,
        capacity,
      })

      return sidequestRepository.createRequest(handle, createdSidequest.id, requestedById, request)
    },

    async reviewRequest(handle, id, reviewedById, review) {
      const sidequestRequest = await sidequestRepository.findRequestById(handle, id)
      if (sidequestRequest === null) {
        throw new NotFoundError(`SidequestRequest(ID=${id}) not found`)
      }

      await sidequestRepository.update(handle, sidequestRequest.sidequestId, {
        status: review.status,
      })

      const { status, ...requestUpdate } = review

      return sidequestRepository.updateRequest(handle, id, {
        ...requestUpdate,
        approvedAmount: review.status === SidequestStatusSchema.enum.PUBLISHED ? review.approvedAmount : null,
        reviewedById,
        reviewedAt: getCurrentUTC(),
      })
    },
  }
}
