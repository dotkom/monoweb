import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { hasGroupRole, isAdministrator, isGroupMember, or } from "../../authorization"
import { InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t, type Principal } from "../../trpc"
import { CommitteeGroupSlug, type AuthorizationService } from "../authorization-service"
import {
  InterestGroupEventFilterQuerySchema,
  InterestGroupEventRegistrationSchema,
  InterestGroupEventSchema,
  InterestGroupEventStatusSchema,
  InterestGroupEventSummarySchema,
  InterestGroupEventWriteSchema,
} from "./interest-group-event"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { GroupSchema, GroupRoleTypeEnum } from "../group/group"

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

const createInterestGroupEventFileUploadProcedure = procedure
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

export const interestGroupEventRouter = t.router({
  create: createInterestGroupEventProcedure,
  update: updateInterestGroupEventProcedure,
  findById: findInterestGroupEventProcedure,
  getById: getInterestGroupEventProcedure,
  findMany: findManyInterestGroupEventsProcedure,
  findRegistrations: findInterestGroupEventRegistrationsProcedure,
  createFileUpload: createInterestGroupEventFileUploadProcedure,
  createRegistration: createInterestGroupEventRegistrationProcedure,
  deleteRegistration: deleteInterestGroupEventRegistrationProcedure,
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
