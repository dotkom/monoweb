import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { createS3PresignedPost, getCurrentUTC, slugify } from "@dotkomonline/utils"
import type { Configuration } from "../../configuration"
import { NotFoundError } from "../../error"
import { CommitteeGroupSlug } from "../authorization-service"
import { createGroupPageUrl, getGroupDisplayName, type GroupId } from "../group/group"
import { NotificationTypeSchema } from "../notification/notification"
import type { NotificationService } from "../notification/notification-service"
import type { UserId } from "../user/user"
import type {
  InterestGroupEventFilterQuery,
  InterestGroupEventId,
  InterestGroupEventRegistration,
  InterestGroupEventRegistrationId,
  InterestGroupEventRequestId,
  InterestGroupEventRequestReviewWrite,
  InterestGroupEventRequestWrite,
  InterestGroupEventSummary,
  InterestGroupEventSummaryWithRequest,
  InterestGroupEventWrite,
  RequestedInterestGroupEventWrite,
} from "./interest-group-event"
import { INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB, InterestGroupEventStatusSchema } from "./interest-group-event"
import type { InterestGroupEventRepository } from "./interest-group-event-repository"

export interface InterestGroupEventService {
  create(handle: DBHandle, data: InterestGroupEventWrite, createdById: UserId): Promise<InterestGroupEventSummary>
  update(
    handle: DBHandle,
    id: InterestGroupEventId,
    data: Partial<InterestGroupEventWrite>,
    createdById: UserId
  ): Promise<InterestGroupEventSummary>
  findById(handle: DBHandle, id: InterestGroupEventId, includeUsers: boolean): Promise<InterestGroupEventSummary | null>
  getById(handle: DBHandle, id: InterestGroupEventId, includeUsers: boolean): Promise<InterestGroupEventSummary>
  findByIdWithRequest(
    handle: DBHandle,
    id: InterestGroupEventId,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummaryWithRequest | null>
  getByIdWithRequest(
    handle: DBHandle,
    id: InterestGroupEventId,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummaryWithRequest>
  findMany(
    handle: DBHandle,
    query: InterestGroupEventFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummary[]>
  findManyWithRequest(
    handle: DBHandle,
    query: InterestGroupEventFilterQuery,
    page: Pageable,
    includeUsers: boolean
  ): Promise<InterestGroupEventSummaryWithRequest[]>

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

  createRequest(
    handle: DBHandle,
    interestGroupId: GroupId,
    requestedById: UserId,
    event: RequestedInterestGroupEventWrite,
    request: InterestGroupEventRequestWrite
  ): Promise<InterestGroupEventSummaryWithRequest>
  reviewRequest(
    handle: DBHandle,
    id: InterestGroupEventRequestId,
    reviewedById: UserId,
    review: InterestGroupEventRequestReviewWrite
  ): Promise<InterestGroupEventSummaryWithRequest>
}

export function getInterestGroupEventService(
  interestGroupEventRepository: InterestGroupEventRepository,
  s3Client: S3Client,
  s3BucketName: string,
  notificationService: NotificationService,
  configuration: Configuration
): InterestGroupEventService {
  return {
    async create(handle, data, createdById) {
      const isBeingPublished = data.status === InterestGroupEventStatusSchema.enum.PUBLISHED
      const created = await interestGroupEventRepository.create(handle, data)

      if (isBeingPublished) {
        await sendPublishedNotification(handle, created, createdById)
      }

      return created
    },

    async update(handle, id, data, createdById) {
      const previous = await this.getById(handle, id, false)
      const isBeingPublished =
        previous.status !== InterestGroupEventStatusSchema.enum.PUBLISHED &&
        data.status === InterestGroupEventStatusSchema.enum.PUBLISHED

      const updated = await interestGroupEventRepository.update(handle, id, data)

      if (isBeingPublished) {
        await sendPublishedNotification(handle, updated, createdById)
      }

      return updated
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

    async findByIdWithRequest(handle, id, includeUsers) {
      return interestGroupEventRepository.findByIdWithRequest(handle, id, includeUsers)
    },

    async getByIdWithRequest(handle, id, includeUsers) {
      const interestGroupEvent = await interestGroupEventRepository.findByIdWithRequest(handle, id, includeUsers)
      if (interestGroupEvent === null) {
        throw new NotFoundError(`InterestGroupEvent(ID=${id}) not found`)
      }

      return interestGroupEvent
    },

    async findMany(handle, query, page, includeUsers) {
      return interestGroupEventRepository.findMany(handle, query, page, includeUsers)
    },

    async findManyWithRequest(handle, query, page, includeUsers) {
      return interestGroupEventRepository.findManyWithRequest(handle, query, page, includeUsers)
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

    async createRequest(handle, interestGroupId, requestedById, event, request) {
      const interestGroupEvent = await interestGroupEventRepository.create(handle, {
        ...event,
        interestGroupId,
        status: InterestGroupEventStatusSchema.enum.IN_REVIEW,
      })

      const createdRequest = await interestGroupEventRepository.createRequest(
        handle,
        interestGroupEvent.id,
        requestedById,
        request
      )

      const groupDisplayName = getGroupDisplayName(interestGroupEvent.interestGroup)

      await notificationService.send(handle, {
        type: NotificationTypeSchema.enum.NEW_INTEREST_GROUP_EVENT_REQUEST,
        title: `Ny søknad: ${interestGroupEvent.title}`,
        shortDescription: `${groupDisplayName} har søkt om å arrangere et arrangement.`,
        link: {
          type: "URL",
          url: `${configuration.WEB_PUBLIC_ORIGIN}/admin/interessegrupper/${interestGroupEvent.id}`,
        },
        recipientSelection: {
          rules: [{ type: "GROUP_MEMBERS", groupSlug: CommitteeGroupSlug.BACKLOG, includeFormerMembers: false }],
          excludedUserIds: [],
        },
        actorGroupId: interestGroupId,
        createdById: requestedById,
      })

      return createdRequest
    },

    async reviewRequest(handle, id, reviewedById, review) {
      const interestGroupEventRequest = await interestGroupEventRepository.findRequestById(handle, id)
      if (interestGroupEventRequest === null) {
        throw new NotFoundError(`InterestGroupEventRequest(ID=${id}) not found`)
      }

      const previous = await this.getById(handle, interestGroupEventRequest.interestGroupEventId, false)

      await interestGroupEventRepository.update(handle, interestGroupEventRequest.interestGroupEventId, {
        status: review.status,
      })

      const { status, ...requestUpdate } = review

      const updatedRequest = await interestGroupEventRepository.updateRequest(handle, id, {
        ...requestUpdate,
        approvedAmount: review.status === "PUBLISHED" ? review.approvedAmount : null,
        reviewedById,
        reviewedAt: getCurrentUTC(),
      })

      const isApproved = review.status === InterestGroupEventStatusSchema.enum.PUBLISHED

      await notificationService.send(handle, {
        type: NotificationTypeSchema.enum.INTEREST_GROUP_EVENT_REQUEST_REVIEWED,
        title: isApproved
          ? `Søknaden din er godkjent: ${updatedRequest.title}`
          : `Søknaden din er avslått: ${updatedRequest.title}`,
        shortDescription: isApproved
          ? `"${updatedRequest.title}" er publisert og synlig for medlemmer.`
          : `Søknaden om å arrangere "${updatedRequest.title}" er avslått.`,
        link: {
          type: "URL",
          url: `${configuration.WEB_PUBLIC_ORIGIN}${createGroupPageUrl(updatedRequest.interestGroup)}`,
        },
        recipientSelection: {
          rules: [{ type: "USERS", userIds: [interestGroupEventRequest.requestedById] }],
          excludedUserIds: [],
        },
        actorGroupId: CommitteeGroupSlug.BACKLOG,
        createdById: reviewedById,
      })

      if (isApproved && previous.status !== InterestGroupEventStatusSchema.enum.PUBLISHED) {
        await sendPublishedNotification(handle, updatedRequest, reviewedById, [interestGroupEventRequest.requestedById])
      }

      return updatedRequest
    },
  }

  async function sendPublishedNotification(
    handle: DBHandle,
    interestGroupEvent: InterestGroupEventSummary,
    createdById: UserId,
    excludedUserIds: UserId[] = []
  ) {
    const displayName = getGroupDisplayName(interestGroupEvent.interestGroup)

    await notificationService.send(handle, {
      type: NotificationTypeSchema.enum.NEW_INTEREST_GROUP_EVENT,
      title: `Nytt arrangement: ${interestGroupEvent.title}`,
      shortDescription: `${displayName} har publisert et nytt arrangement.`,
      link: {
        type: "INTEREST_GROUP_EVENT",
        interestGroupEventId: interestGroupEvent.id,
      },
      recipientSelection: {
        rules: [{ type: "GROUP_MEMBERS", groupSlug: interestGroupEvent.interestGroupId, includeFormerMembers: false }],
        excludedUserIds,
      },
      actorGroupId: interestGroupEvent.interestGroupId,
      createdById,
    })
  }
}
