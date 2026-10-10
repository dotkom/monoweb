import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { hasGroupRole, isAdministrator, isGroupMember, or } from "../../authorization"
import { InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t, type Principal } from "../../trpc"
import { CommitteeGroupSlug, type AuthorizationService } from "../authorization-service"
import { GroupRoleTypeEnum, GroupSchema } from "../group/group"
import {
  InterestGroupEventFilterQuerySchema,
  InterestGroupEventRegistrationSchema,
  InterestGroupEventRequestReviewWriteSchema,
  InterestGroupEventRequestSchema,
  InterestGroupEventRequestWriteSchema,
  InterestGroupEventSchema,
  InterestGroupEventStatusSchema,
  InterestGroupEventSummarySchema,
  InterestGroupEventSummaryWithRequestSchema,
  InterestGroupEventWriteSchema,
  RequestedInterestGroupEventWriteSchema,
  type InterestGroupEventSummaryWithRequest,
} from "./interest-group-event"

export type CreateInterestGroupEventInput = inferProcedureInput<typeof createInterestGroupEventProcedure>
export type CreateInterestGroupEventOutput = inferProcedureOutput<typeof createInterestGroupEventProcedure>
const createInterestGroupEventProcedure = procedure
  .input(
    z.object({
      interestGroupEvent: InterestGroupEventWriteSchema,
    })
  )
  .output(InterestGroupEventSummarySchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const interestGroupEvent = await ctx.interestGroupEventService.create(ctx.handle, input.interestGroupEvent)
    ctx.setAuditTransactionName(
      `Create InterestGroupEvent(ID=${interestGroupEvent.id},Title=${interestGroupEvent.title})`
    )

    return interestGroupEvent
  })

export type UpdateInterestGroupEventInput = inferProcedureInput<typeof updateInterestGroupEventProcedure>
export type UpdateInterestGroupEventOutput = inferProcedureOutput<typeof updateInterestGroupEventProcedure>
const updateInterestGroupEventProcedure = procedure
  .input(
    z.object({
      id: InterestGroupEventSchema.shape.id,
      interestGroupEvent: InterestGroupEventWriteSchema.partial(),
    })
  )
  .output(InterestGroupEventSummarySchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const interestGroupEvent = await ctx.interestGroupEventService.update(
      ctx.handle,
      input.id,
      input.interestGroupEvent
    )
    ctx.setAuditTransactionName(
      `Update InterestGroupEvent(ID=${interestGroupEvent.id},Title=${interestGroupEvent.title})`
    )

    return interestGroupEvent
  })

export type FindInterestGroupEventInput = inferProcedureInput<typeof findInterestGroupEventProcedure>
export type FindInterestGroupEventOutput = inferProcedureOutput<typeof findInterestGroupEventProcedure>
const findInterestGroupEventProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .output(InterestGroupEventSummarySchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const interestGroupEvent = await ctx.interestGroupEventService.findById(ctx.handle, input, ctx.principal !== null)
    if (interestGroupEvent === null) {
      return null
    }

    const isPublished = interestGroupEvent.status === InterestGroupEventStatusSchema.enum.PUBLISHED
    if (!isPublished && !canSeeUnpublished(ctx)) {
      return null
    }

    return interestGroupEvent
  })

export type GetInterestGroupEventInput = inferProcedureInput<typeof getInterestGroupEventProcedure>
export type GetInterestGroupEventOutput = inferProcedureOutput<typeof getInterestGroupEventProcedure>
const getInterestGroupEventProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .output(InterestGroupEventSummarySchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const interestGroupEvent = await ctx.interestGroupEventService.getById(ctx.handle, input, ctx.principal !== null)

    const isPublished = interestGroupEvent.status === InterestGroupEventStatusSchema.enum.PUBLISHED
    if (!isPublished && !canSeeUnpublished(ctx)) {
      throw new NotFoundError(`InterestGroupEvent(ID=${input}) not found`)
    }

    return interestGroupEvent
  })

export type GetInterestGroupEventByIdWithRequestInput = inferProcedureInput<
  typeof getInterestGroupEventByIdWithRequestProcedure
>
export type GetInterestGroupEventByIdWithRequestOutput = inferProcedureOutput<
  typeof getInterestGroupEventByIdWithRequestProcedure
>
const getInterestGroupEventByIdWithRequestProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .output(InterestGroupEventSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const interestGroupEventWithRequest = await ctx.interestGroupEventService.getByIdWithRequest(
      ctx.handle,
      input,
      ctx.principal !== null
    )

    return interestGroupEventWithRequest
  })

export type CreateInterestGroupEventRegistrationInput = inferProcedureInput<
  typeof createInterestGroupEventRegistrationProcedure
>
export type CreateInterestGroupEventRegistrationOutput = inferProcedureOutput<
  typeof createInterestGroupEventRegistrationProcedure
>
const createInterestGroupEventRegistrationProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .output(InterestGroupEventRegistrationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const interestGroupEvent = await ctx.interestGroupEventService.getById(ctx.handle, input, false)

    const isPublished = interestGroupEvent.status === InterestGroupEventStatusSchema.enum.PUBLISHED
    if (!isPublished && !canSeeUnpublished(ctx)) {
      throw new NotFoundError(`InterestGroupEvent(ID=${input}) not found`)
    }

    return ctx.interestGroupEventService.createRegistration(ctx.handle, input, userId)
  })

export type DeleteInterestGroupEventRegistrationInput = inferProcedureInput<
  typeof deleteInterestGroupEventRegistrationProcedure
>
export type DeleteInterestGroupEventRegistrationOutput = inferProcedureOutput<
  typeof deleteInterestGroupEventRegistrationProcedure
>
const deleteInterestGroupEventRegistrationProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const interestGroupEvent = await ctx.interestGroupEventService.getById(ctx.handle, input, false)

    const isEventPublished = interestGroupEvent.status === InterestGroupEventStatusSchema.enum.PUBLISHED
    if (!isEventPublished && !canSeeUnpublished(ctx)) {
      throw new NotFoundError(`InterestGroupEvent(ID=${input}) not found`)
    }

    return ctx.interestGroupEventService.deleteRegistration(ctx.handle, input, userId)
  })

export type FindManyInterestGroupEventsInput = inferProcedureInput<typeof findManyInterestGroupEventsProcedure>
export type FindManyInterestGroupEventsOutput = inferProcedureOutput<typeof findManyInterestGroupEventsProcedure>
const findManyInterestGroupEventsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: InterestGroupEventFilterQuerySchema.optional() }))
  .output(
    z.object({
      items: InterestGroupEventSummarySchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const canSeeNonPublished = canSeeUnpublished(ctx)

    const filter = {
      ...input.filter,
      byStatus: canSeeNonPublished ? input.filter?.byStatus : [InterestGroupEventStatusSchema.enum.PUBLISHED],
    }

    const items = await ctx.interestGroupEventService.findMany(ctx.handle, filter, input, ctx.principal !== null)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type FindManyInterestGroupEventsWithRequestInput = inferProcedureInput<
  typeof findManyInterestGroupEventsWithRequestProcedure
>
export type FindManyInterestGroupEventsWithRequestOutput = inferProcedureOutput<
  typeof findManyInterestGroupEventsWithRequestProcedure
>
const findManyInterestGroupEventsWithRequestProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: InterestGroupEventFilterQuerySchema.optional() }))
  .output(
    z.object({
      items: InterestGroupEventSummaryWithRequestSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .query(async ({ input, ctx }) => {
    const items = await ctx.interestGroupEventService.findManyWithRequest(
      ctx.handle,
      input.filter ?? {},
      input,
      ctx.principal !== null
    )

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type FindManyInterestGroupEventsWithRequestByInterestGroupIdInput = inferProcedureInput<
  typeof findManyInterestGroupEventsWithRequestByInterestGroupIdProcedure
>
export type FindManyInterestGroupEventsWithRequestByInterestGroupIdOutput = inferProcedureOutput<
  typeof findManyInterestGroupEventsWithRequestByInterestGroupIdProcedure
>
const findManyInterestGroupEventsWithRequestByInterestGroupIdProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      interestGroupId: GroupSchema.shape.slug,
      filter: InterestGroupEventFilterQuerySchema.omit({ byInterestGroupId: true }).optional(),
    })
  )
  .output(
    z.object({
      items: InterestGroupEventSummaryWithRequestSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    if (group.type !== "INTEREST_GROUP") {
      throw new InvalidArgumentError(`Group(Slug=${input.interestGroupId}) is not an interest group`)
    }

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isGroupMember(CommitteeGroupSlug.BACKLOG),
        hasGroupRole(input.interestGroupId, GroupRoleTypeEnum.LEADER)
      ),
      input
    )

    const filter = {
      ...input.filter,
      byInterestGroupId: [input.interestGroupId],
    }

    const items = await ctx.interestGroupEventService.findManyWithRequest(
      ctx.handle,
      filter,
      input,
      ctx.principal !== null
    )

    const itemsWithoutReviewerIdentity = items.map(stripReviewerIdentity)

    return {
      items: itemsWithoutReviewerIdentity,
      nextCursor: itemsWithoutReviewerIdentity.at(-1)?.id,
    }
  })

export type FindInterestGroupEventRegistrationsInput = inferProcedureInput<
  typeof findInterestGroupEventRegistrationsProcedure
>
export type FindInterestGroupEventRegistrationsOutput = inferProcedureOutput<
  typeof findInterestGroupEventRegistrationsProcedure
>
const findInterestGroupEventRegistrationsProcedure = procedure
  .input(InterestGroupEventSchema.shape.id)
  .output(InterestGroupEventRegistrationSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.interestGroupEventService.getById(ctx.handle, input, false)

    return ctx.interestGroupEventService.findRegistrations(ctx.handle, input)
  })

export type CreateInterestGroupEventFileUploadInput = inferProcedureInput<
  typeof createInterestGroupEventFileUploadProcedure
>
export type CreateInterestGroupEventFileUploadOutput = inferProcedureOutput<
  typeof createInterestGroupEventFileUploadProcedure
>
const createInterestGroupEventFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.interestGroupEventService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export type CreateInterestGroupEventFileUploadForGroupInput = inferProcedureInput<
  typeof createInterestGroupEventFileUploadForGroupProcedure
>
export type CreateInterestGroupEventFileUploadForGroupOutput = inferProcedureOutput<
  typeof createInterestGroupEventFileUploadForGroupProcedure
>
const createInterestGroupEventFileUploadForGroupProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
      interestGroupId: GroupSchema.shape.slug,
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    if (group.type !== "INTEREST_GROUP") {
      throw new InvalidArgumentError(`Group(Slug=${input.interestGroupId}) is not an interest group`)
    }

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isGroupMember(CommitteeGroupSlug.BACKLOG),
        hasGroupRole(input.interestGroupId, GroupRoleTypeEnum.LEADER)
      ),
      input
    )

    return ctx.interestGroupEventService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export type CreateInterestGroupEventRequestInput = inferProcedureInput<typeof createInterestGroupEventRequestProcedure>
export type CreateInterestGroupEventRequestOutput = inferProcedureOutput<
  typeof createInterestGroupEventRequestProcedure
>
const createInterestGroupEventRequestProcedure = procedure
  .input(
    z.object({
      interestGroupId: GroupSchema.shape.slug,
      interestGroupEvent: RequestedInterestGroupEventWriteSchema,
      interestGroupEventRequest: InterestGroupEventRequestWriteSchema,
    })
  )
  .output(InterestGroupEventSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    if (group.type !== "INTEREST_GROUP") {
      throw new InvalidArgumentError(`Group(Slug=${input.interestGroupId}) is not an interest group`)
    }

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isGroupMember(CommitteeGroupSlug.BACKLOG),
        hasGroupRole(input.interestGroupId, GroupRoleTypeEnum.LEADER)
      ),
      input
    )

    const interestGroupEventRequest = await ctx.interestGroupEventService.createRequest(
      ctx.handle,
      input.interestGroupId,
      ctx.principal.subject,
      input.interestGroupEvent,
      input.interestGroupEventRequest
    )

    ctx.setAuditTransactionName(
      `Create InterestGroupEventRequest(ID=${interestGroupEventRequest.request?.id},Title=${interestGroupEventRequest.title}) for Group(Slug=${input.interestGroupId},Name=${interestGroupEventRequest.interestGroup.name})`
    )

    return stripReviewerIdentity(interestGroupEventRequest)
  })

export type ReviewInterestGroupEventRequestInput = inferProcedureInput<typeof reviewInterestGroupEventRequestProcedure>
export type ReviewInterestGroupEventRequestOutput = inferProcedureOutput<
  typeof reviewInterestGroupEventRequestProcedure
>
const reviewInterestGroupEventRequestProcedure = procedure
  .input(
    z.object({
      id: InterestGroupEventRequestSchema.shape.id,
      review: InterestGroupEventRequestReviewWriteSchema,
    })
  )
  .output(InterestGroupEventSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const interestGroupEventRequest = await ctx.interestGroupEventService.reviewRequest(
      ctx.handle,
      input.id,
      ctx.principal.subject,
      input.review
    )

    ctx.setAuditTransactionName(
      `Review InterestGroupEventRequest(ID=${interestGroupEventRequest.request?.id},Title=${interestGroupEventRequest.title},Status=${input.review.status})`
    )

    return interestGroupEventRequest
  })

export const interestGroupEventRouter = t.router({
  create: createInterestGroupEventProcedure,
  update: updateInterestGroupEventProcedure,
  findById: findInterestGroupEventProcedure,
  getById: getInterestGroupEventProcedure,
  getByIdWithRequest: getInterestGroupEventByIdWithRequestProcedure,
  findMany: findManyInterestGroupEventsProcedure,
  findManyWithRequest: findManyInterestGroupEventsWithRequestProcedure,
  findManyWithRequestByInterestGroupId: findManyInterestGroupEventsWithRequestByInterestGroupIdProcedure,
  findRegistrations: findInterestGroupEventRegistrationsProcedure,
  createFileUpload: createInterestGroupEventFileUploadProcedure,
  createFileUploadForGroup: createInterestGroupEventFileUploadForGroupProcedure,
  createRegistration: createInterestGroupEventRegistrationProcedure,
  deleteRegistration: deleteInterestGroupEventRegistrationProcedure,
  createRequest: createInterestGroupEventRequestProcedure,
  reviewRequest: reviewInterestGroupEventRequestProcedure,
})

type InterestGroupEventAccess = {
  principal: Principal | null
  authorizationService: AuthorizationService
}

function canSeeUnpublished(ctx: InterestGroupEventAccess) {
  if (ctx.principal === null) {
    return false
  }

  return (
    ctx.authorizationService.isAdministrator(ctx.principal.affiliations) ||
    ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, [CommitteeGroupSlug.BACKLOG])
  )
}

function stripReviewerIdentity(item: InterestGroupEventSummaryWithRequest) {
  return {
    ...item,
    request:
      item.request === null
        ? null
        : {
            ...item.request,
            reviewedById: null,
          },
  }
}
