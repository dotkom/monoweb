import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Pageable } from "@dotkomonline/utils"
import { createS3PresignedPost, getCurrentUTC, slugify } from "@dotkomonline/utils"
import type { Configuration } from "../../configuration"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import { CommitteeGroupSlug } from "../authorization-service"
import { getGroupDisplayName, getInterestGroupAdminUrl, GroupTypeSchema, type GroupId } from "../group/group"
import type { GroupService } from "../group/group-service"
import { NotificationPayloadTypeSchema, NotificationTypeSchema } from "../notification/notification"
import type { NotificationService } from "../notification/notification-service"
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
  create(handle: DBHandle, data: SidequestWrite, createdById: UserId): Promise<SidequestSummary>
  update(
    handle: DBHandle,
    id: SidequestId,
    data: Partial<SidequestWrite>,
    createdById: UserId
  ): Promise<SidequestSummary>
  findById(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummary | null>
  getById(handle: DBHandle, id: SidequestId, includeUsers: boolean): Promise<SidequestSummary>
  findByIdWithRequest(
    handle: DBHandle,
    id: SidequestId,
    includeUsers: boolean
  ): Promise<SidequestSummaryWithRequest | null>
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
  s3BucketName: string,
  notificationService: NotificationService,
  configuration: Configuration
): SidequestService {
  return {
    async create(handle, data, createdById) {
      const interestGroup = await groupService.getBySlug(handle, data.interestGroupId)
      if (interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const capacity = data.capacity === 0 ? null : data.capacity

      const isBeingPublished = data.status === SidequestStatusSchema.enum.PUBLISHED
      const created = await sidequestRepository.create(handle, { ...data, capacity })

      if (isBeingPublished) {
        await sendPublishedNotification(handle, created, createdById)
      }

      return created
    },

    async update(handle, id, data, createdById) {
      const interestGroup =
        data.interestGroupId != null ? await groupService.getBySlug(handle, data.interestGroupId) : null
      if (interestGroup !== null && interestGroup.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(
          `Group(Slug=${data.interestGroupId},Name=${interestGroup.name}) is not an interest group`
        )
      }

      const previous = await this.getById(handle, id, false)
      const isBeingPublished =
        previous.status !== SidequestStatusSchema.enum.PUBLISHED && data.status === SidequestStatusSchema.enum.PUBLISHED

      const capacity = data.capacity === 0 ? null : data.capacity

      const updated = await sidequestRepository.update(handle, id, { ...data, capacity })

      if (isBeingPublished) {
        await sendPublishedNotification(handle, updated, createdById)
      }

      return updated
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

    async findByIdWithRequest(handle, id, includeUsers) {
      return sidequestRepository.findByIdWithRequest(handle, id, includeUsers)
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

      const createdRequest = await sidequestRepository.createRequest(
        handle,
        createdSidequest.id,
        requestedById,
        request
      )

      const groupDisplayName = getGroupDisplayName(createdSidequest.interestGroup)

      await notificationService.send(handle, {
        type: NotificationTypeSchema.enum.NEW_SIDEQUEST_REQUEST,
        title: `Ny søknad: ${createdSidequest.title}`,
        shortDescription: `${groupDisplayName} har søkt om å arrangere en Sidequest.`,
        link: {
          type: NotificationPayloadTypeSchema.enum.URL,
          url: `${configuration.WEB_PUBLIC_ORIGIN}/admin/sidequests/${createdSidequest.id}`,
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
      const sidequestRequest = await sidequestRepository.findRequestById(handle, id)
      if (sidequestRequest === null) {
        throw new NotFoundError(`SidequestRequest(ID=${id}) not found`)
      }

      const previous = await this.getById(handle, sidequestRequest.sidequestId, false)

      await sidequestRepository.update(handle, sidequestRequest.sidequestId, {
        status: review.status,
      })

      const { status, ...requestUpdate } = review

      const updatedRequest = await sidequestRepository.updateRequest(handle, id, {
        ...requestUpdate,
        approvedAmount: review.status === SidequestStatusSchema.enum.PUBLISHED ? review.approvedAmount : null,
        reviewedById,
        reviewedAt: getCurrentUTC(),
      })

      const isApproved = review.status === SidequestStatusSchema.enum.PUBLISHED
      const approvedAmount = review.status === SidequestStatusSchema.enum.PUBLISHED ? review.approvedAmount : null
      const hasApprovedFunding = approvedAmount !== null && approvedAmount > 0

      await notificationService.send(handle, {
        type: NotificationTypeSchema.enum.SIDEQUEST_REQUEST_REVIEWED,
        title: isApproved
          ? `Søknaden din er godkjent: ${updatedRequest.title}`
          : `Søknaden din er avslått: ${updatedRequest.title}`,
        shortDescription: isApproved
          ? hasApprovedFunding
            ? `"${updatedRequest.title}" er publisert. Husk å sende kvittering innen 2 uker.`
            : `"${updatedRequest.title}" er publisert og synlig for medlemmer.`
          : `Søknaden om å arrangere "${updatedRequest.title}" er avslått.`,
        content: hasApprovedFunding
          ? [
              `<p>"${updatedRequest.title}" er publisert og synlig for medlemmer. Dere er innvilget ${approvedAmount} kr i støtte.</p>`,
              '<p>Man må selv legge ut, og i etterkant sende inn kvittering på <a href="https://autobank.online.ntnu.no/">Autobank.online.ntnu.no</a> med informasjon om hvor mange som møtte opp. Kvitteringen må sendes innen 2 uker etter arrangementet. I feltet «Ansvarlig enhet» setter du Backlog, og ellers bare beskriv hva utlegget har gått til.</p>',
            ].join("")
          : undefined,
        link: {
          type: NotificationPayloadTypeSchema.enum.URL,
          url: `${configuration.WEB_PUBLIC_ORIGIN}${getInterestGroupAdminUrl(updatedRequest.interestGroup.slug)}/soknader/${updatedRequest.id}`,
        },
        recipientSelection: {
          rules: [{ type: "USERS", userIds: [sidequestRequest.requestedById] }],
          excludedUserIds: [],
        },
        actorGroupId: CommitteeGroupSlug.BACKLOG,
        createdById: reviewedById,
      })

      if (isApproved && previous.status !== SidequestStatusSchema.enum.PUBLISHED) {
        await sendPublishedNotification(handle, updatedRequest, reviewedById, [sidequestRequest.requestedById])
      }

      return updatedRequest
    },
  }

  async function sendPublishedNotification(
    handle: DBHandle,
    sidequest: SidequestSummary,
    createdById: UserId,
    excludedUserIds: UserId[] = []
  ) {
    const displayName = getGroupDisplayName(sidequest.interestGroup)

    await notificationService.send(handle, {
      type: NotificationTypeSchema.enum.NEW_SIDEQUEST,
      title: `Ny Sidequest: ${sidequest.title}`,
      shortDescription: `${displayName} har publisert en ny Sidequest.`,
      link: {
        type: NotificationPayloadTypeSchema.enum.SIDEQUEST,
        sidequestId: sidequest.id,
      },
      recipientSelection: {
        rules: [{ type: "GROUP_MEMBERS", groupSlug: sidequest.interestGroupId, includeFormerMembers: false }],
        excludedUserIds,
      },
      actorGroupId: sidequest.interestGroupId,
      createdById,
    })
  }
}
