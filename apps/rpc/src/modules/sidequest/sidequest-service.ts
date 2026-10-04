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
  isSidequestDeregistrationOpen,
  isSidequestRegistrationOpen,
} from "./sidequest"
import type { SidequestRepository } from "./sidequest-repository"

export interface SidequestService {
  create(handle: DBHandle, data: SidequestWrite, actorUserId: UserId): Promise<SidequestSummary>
  update(
    handle: DBHandle,
    sidequestId: SidequestId,
    data: Partial<SidequestWrite>,
    actorUserId: UserId
  ): Promise<SidequestSummary>
  findById(handle: DBHandle, sidequestId: SidequestId, includeUsers: boolean): Promise<SidequestSummary | null>
  getById(handle: DBHandle, sidequestId: SidequestId, includeUsers: boolean): Promise<SidequestSummary>
  findByIdWithRequest(
    handle: DBHandle,
    sidequestId: SidequestId,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest | null>
  getByIdWithRequest(
    handle: DBHandle,
    sidequestId: SidequestId,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest>
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
  findRegistrationById(
    handle: DBHandle,
    sidequestRegistrationId: SidequestRegistrationId
  ): Promise<SidequestRegistration | null>
  findRegistrations(handle: DBHandle, sidequestId: SidequestId): Promise<SidequestRegistration[]>

  createFileUpload(filename: string, contentType: string, createdByUserId: UserId): Promise<PresignedPost>

  createRequest(
    handle: DBHandle,
    interestGroupId: GroupId,
    requestedById: UserId,
    sidequest: RequestedSidequestWrite,
    sidequestRequest: SidequestRequestWrite
  ): Promise<SidequestSummaryWithRequest>
  reviewRequest(
    handle: DBHandle,
    sidequestRequestId: SidequestRequestId,
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
      const interestGroup = await groupService.getBySlug(handle, data.interestGroupId)
      if (interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const capacity = data.capacity === 0 ? null : data.capacity

      return await sidequestRepository.create(handle, { ...data, capacity })
    },

    async update(handle, sidequestId, data) {
      const interestGroup =
        data.interestGroupId != null ? await groupService.getBySlug(handle, data.interestGroupId) : null
      if (interestGroup !== null && interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const capacity = data.capacity === 0 ? null : data.capacity

      return await sidequestRepository.update(handle, sidequestId, { ...data, capacity })
    },

    async findById(handle, sidequestId, includeUsers) {
      return sidequestRepository.findById(handle, sidequestId, includeUsers)
    },

    async getById(handle, sidequestId, includeUsers) {
      const sidequest = await this.findById(handle, sidequestId, includeUsers)
      if (sidequest === null) {
        throw new NotFoundError(`Sidequest(ID=${sidequestId}) not found`)
      }

      return sidequest
    },

    async findByIdWithRequest(handle, sidequestId, includeUsers) {
      return sidequestRepository.findByIdWithRequest(handle, sidequestId, includeUsers)
    },

    async getByIdWithRequest(handle, sidequestId, includeUsers) {
      const sidequest = await this.findByIdWithRequest(handle, sidequestId, includeUsers)
      if (sidequest === null) {
        throw new NotFoundError(`Sidequest(ID=${sidequestId}) not found`)
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
      if (!isSidequestRegistrationOpen(sidequest)) {
        throw new FailedPreconditionError(
          `Cannot register for Sidequest(ID=${sidequestId}) after registration has closed`
        )
      }

      return sidequestRepository.createRegistration(handle, sidequestId, userId)
    },

    async deleteRegistration(handle, sidequestId, userId) {
      const sidequest = await this.getById(handle, sidequestId, false)
      if (!isSidequestDeregistrationOpen(sidequest)) {
        throw new FailedPreconditionError(
          `Cannot deregister from Sidequest(ID=${sidequestId}) after deregistration has closed`
        )
      }

      return sidequestRepository.deleteRegistration(handle, sidequestId, userId)
    },

    async findRegistrationById(handle, sidequestRegistrationId) {
      return sidequestRepository.findRegistrationById(handle, sidequestRegistrationId)
    },

    async findRegistrations(handle, sidequestId) {
      return sidequestRepository.findRegistrations(handle, sidequestId)
    },

    async createFileUpload(filename, contentType, actorUserId) {
      const uuid = crypto.randomUUID()
      const key = `sidequest/${Date.now()}-${uuid}-${slugify(filename)}`

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB: SIDEQUEST_IMAGE_MAX_SIZE_KIB,
        contentType,
        createdByUserId: actorUserId,
      })
    },

    async createRequest(handle, interestGroupId, requestedById, sidequest, sidequestRequest) {
      const capacity = sidequest.capacity === 0 ? null : sidequest.capacity

      const createdSidequest = await this.create(
        handle,
        {
          ...sidequest,
          capacity,
          interestGroupId,
          status: SidequestStatusSchema.enum.IN_REVIEW,
        },
        requestedById
      )

      return await sidequestRepository.createRequest(handle, createdSidequest.id, requestedById, sidequestRequest)
    },

    async reviewRequest(handle, sidequestRequestId, reviewedById, review) {
      const sidequestRequest = await sidequestRepository.findRequestById(handle, sidequestRequestId)
      if (sidequestRequest === null) {
        throw new NotFoundError(`SidequestRequest(ID=${sidequestRequestId}) not found`)
      }

      await sidequestRepository.update(handle, sidequestRequest.sidequestId, {
        status: review.status,
      })

      const { status: _status, ...requestUpdate } = review

      return await sidequestRepository.updateRequest(handle, sidequestRequestId, {
        ...requestUpdate,
        approvedAmountNok: review.status === SidequestStatusSchema.enum.PUBLISHED ? review.approvedAmountNok : null,
        reviewedById,
        reviewedAt: getCurrentUTC(),
      })
    },
  }
}
