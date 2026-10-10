import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { hasGroupRole, isAdministrator, isGroupMember, or } from "../../authorization"
import { InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t, type Principal } from "../../trpc"
import { CommitteeGroupSlug, type AuthorizationService } from "../authorization-service"
import { GroupRoleTypeEnum, GroupSchema, GroupTypeSchema } from "../group/group"
import {
  RequestedSidequestWriteSchema,
  SidequestFilterQuerySchema,
  SidequestRegistrationSchema,
  SidequestRequestReviewWriteSchema,
  SidequestRequestSchema,
  SidequestRequestWriteSchema,
  SidequestSchema,
  SidequestStatusSchema,
  SidequestSummarySchema,
  SidequestSummaryWithRequestSchema,
  SidequestWriteSchema,
  type SidequestSummary,
  type SidequestSummaryWithRequest,
} from "./sidequest"
import type { SidequestService } from "./sidequest-service"

export type CreateSidequestInput = inferProcedureInput<typeof createSidequestProcedure>
export type CreateSidequestOutput = inferProcedureOutput<typeof createSidequestProcedure>
const createSidequestProcedure = procedure
  .input(
    z.object({
      sidequest: SidequestWriteSchema,
    })
  )
  .output(SidequestSummarySchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.create(ctx.handle, input.sidequest, ctx.principal.subject)
    ctx.setAuditTransactionName(`Create Sidequest(ID=${sidequest.id},Title=${sidequest.title})`)

    return sidequest
  })

export type UpdateSidequestInput = inferProcedureInput<typeof updateSidequestProcedure>
export type UpdateSidequestOutput = inferProcedureOutput<typeof updateSidequestProcedure>
const updateSidequestProcedure = procedure
  .input(
    z.object({
      id: SidequestSchema.shape.id,
      sidequest: SidequestWriteSchema.partial(),
    })
  )
  .output(SidequestSummarySchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.update(ctx.handle, input.id, input.sidequest, ctx.principal.subject)
    ctx.setAuditTransactionName(`Update Sidequest(ID=${sidequest.id},Title=${sidequest.title})`)

    return sidequest
  })

export type FindSidequestInput = inferProcedureInput<typeof findSidequestProcedure>
export type FindSidequestOutput = inferProcedureOutput<typeof findSidequestProcedure>
const findSidequestProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(SidequestSummarySchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.findById(ctx.handle, input, ctx.principal !== null)
    if (sidequest === null) {
      return null
    }

    const canAccess = await canAccessSidequest(ctx, sidequest)
    if (!canAccess) {
      return null
    }

    return sidequest
  })

export type GetSidequestInput = inferProcedureInput<typeof getSidequestProcedure>
export type GetSidequestOutput = inferProcedureOutput<typeof getSidequestProcedure>
const getSidequestProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(SidequestSummarySchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input, ctx.principal !== null)

    const canAccess = await canAccessSidequest(ctx, sidequest)
    if (!canAccess) {
      throw new NotFoundError(`Sidequest(ID=${input}) not found`)
    }

    return sidequest
  })

export type GetSidequestByIdWithRequestInput = inferProcedureInput<typeof getSidequestByIdWithRequestProcedure>
export type GetSidequestByIdWithRequestOutput = inferProcedureOutput<typeof getSidequestByIdWithRequestProcedure>
const getSidequestByIdWithRequestProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(SidequestSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.getByIdWithRequest(ctx.handle, input, ctx.principal !== null)

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isGroupMember(CommitteeGroupSlug.BACKLOG),
        hasGroupRole(sidequest.interestGroup.slug, GroupRoleTypeEnum.LEADER)
      ),
      input
    )

    const canSeeIdentity =
      ctx.authorizationService.isAdministrator(ctx.principal.affiliations) ||
      ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, [CommitteeGroupSlug.BACKLOG])

    return canSeeIdentity ? sidequest : stripReviewerIdentity(sidequest)
  })

export type CreateSidequestRegistrationInput = inferProcedureInput<typeof createSidequestRegistrationProcedure>
export type CreateSidequestRegistrationOutput = inferProcedureOutput<typeof createSidequestRegistrationProcedure>
const createSidequestRegistrationProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(SidequestRegistrationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input, false)
    const user = await ctx.userService.getById(ctx.handle, userId)

    const isPublished = sidequest.status === SidequestStatusSchema.enum.PUBLISHED
    if (!isPublished && !canSeeUnpublished(ctx)) {
      throw new NotFoundError(`Sidequest(ID=${input}) not found`)
    }

    const createdRegistration = await ctx.sidequestService.createRegistration(ctx.handle, input, userId)
    ctx.setAuditTransactionName(
      `Register User(ID=${userId},Name=${user.name}) for Sidequest(ID=${input},Title=${sidequest.title})`
    )

    return createdRegistration
  })

export type DeleteSidequestRegistrationInput = inferProcedureInput<typeof deleteSidequestRegistrationProcedure>
export type DeleteSidequestRegistrationOutput = inferProcedureOutput<typeof deleteSidequestRegistrationProcedure>
const deleteSidequestRegistrationProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(z.void())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const user = await ctx.userService.getById(ctx.handle, userId)
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input, false)

    const isPublished = sidequest.status === SidequestStatusSchema.enum.PUBLISHED
    if (!isPublished && !canSeeUnpublished(ctx)) {
      throw new NotFoundError(`Sidequest(ID=${input}) not found`)
    }

    await ctx.sidequestService.deleteRegistration(ctx.handle, input, userId)
    ctx.setAuditTransactionName(
      `Deregister User(ID=${userId},Name=${user.name}) from Sidequest(ID=${input},Title=${sidequest.title})`
    )
  })

export type FindManySidequestsInput = inferProcedureInput<typeof findManySidequestsProcedure>
export type FindManySidequestsOutput = inferProcedureOutput<typeof findManySidequestsProcedure>
const findManySidequestsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: SidequestFilterQuerySchema.optional() }))
  .output(
    z.object({
      items: SidequestSummarySchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const canSeeNonPublished = canSeeUnpublished(ctx)

    const filter = {
      ...input.filter,
      byStatus: canSeeNonPublished ? input.filter?.byStatus : [SidequestStatusSchema.enum.PUBLISHED],
    }

    const items = await ctx.sidequestService.findMany(ctx.handle, filter, input, ctx.principal !== null)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type FindManySidequestsWithRequestInput = inferProcedureInput<typeof findManySidequestsWithRequestProcedure>
export type FindManySidequestsWithRequestOutput = inferProcedureOutput<typeof findManySidequestsWithRequestProcedure>
const findManySidequestsWithRequestProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: SidequestFilterQuerySchema.optional() }))
  .output(
    z.object({
      items: SidequestSummaryWithRequestSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .query(async ({ input, ctx }) => {
    const items = await ctx.sidequestService.findManyWithRequest(
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

export type FindManySidequestsWithRequestByInterestGroupIdInput = inferProcedureInput<
  typeof findManySidequestsWithRequestByInterestGroupIdProcedure
>
export type FindManySidequestsWithRequestByInterestGroupIdOutput = inferProcedureOutput<
  typeof findManySidequestsWithRequestByInterestGroupIdProcedure
>
const findManySidequestsWithRequestByInterestGroupIdProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      interestGroupId: GroupSchema.shape.slug,
      filter: SidequestFilterQuerySchema.omit({ byInterestGroupId: true }).optional(),
    })
  )
  .output(
    z.object({
      items: SidequestSummaryWithRequestSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
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

    const items = await ctx.sidequestService.findManyWithRequest(ctx.handle, filter, input, ctx.principal !== null)

    const itemsWithoutReviewerIdentity = items.map(stripReviewerIdentity)

    return {
      items: itemsWithoutReviewerIdentity,
      nextCursor: itemsWithoutReviewerIdentity.at(-1)?.id,
    }
  })

export type FindSidequestRegistrationsInput = inferProcedureInput<typeof findSidequestRegistrationsProcedure>
export type FindSidequestRegistrationsOutput = inferProcedureOutput<typeof findSidequestRegistrationsProcedure>
const findSidequestRegistrationsProcedure = procedure
  .input(SidequestSchema.shape.id)
  .output(SidequestRegistrationSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.sidequestService.getById(ctx.handle, input, false)

    return ctx.sidequestService.findRegistrations(ctx.handle, input)
  })

export type CreateSidequestFileUploadInput = inferProcedureInput<typeof createSidequestFileUploadProcedure>
export type CreateSidequestFileUploadOutput = inferProcedureOutput<typeof createSidequestFileUploadProcedure>
const createSidequestFileUploadProcedure = procedure
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
    return ctx.sidequestService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export type CreateSidequestFileUploadForGroupInput = inferProcedureInput<
  typeof createSidequestFileUploadForGroupProcedure
>
export type CreateSidequestFileUploadForGroupOutput = inferProcedureOutput<
  typeof createSidequestFileUploadForGroupProcedure
>
const createSidequestFileUploadForGroupProcedure = procedure
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
    if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
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

    return ctx.sidequestService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export type CreateSidequestRequestInput = inferProcedureInput<typeof createSidequestRequestProcedure>
export type CreateSidequestRequestOutput = inferProcedureOutput<typeof createSidequestRequestProcedure>
const createSidequestRequestProcedure = procedure
  .input(
    z.object({
      interestGroupId: GroupSchema.shape.slug,
      sidequest: RequestedSidequestWriteSchema,
      sidequestRequest: SidequestRequestWriteSchema,
    })
  )
  .output(SidequestSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const user = await ctx.userService.getById(ctx.handle, userId)
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
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

    const sidequestRequest = await ctx.sidequestService.createRequest(
      ctx.handle,
      input.interestGroupId,
      userId,
      input.sidequest,
      input.sidequestRequest
    )

    ctx.setAuditTransactionName(
      `Create SidequestRequest(ID=${sidequestRequest.request?.id},Title=${sidequestRequest.title},RequestedBy=${user.name}) for Group(Slug=${input.interestGroupId},Name=${sidequestRequest.interestGroup.name})`
    )

    return stripReviewerIdentity(sidequestRequest)
  })

export type ReviewSidequestRequestInput = inferProcedureInput<typeof reviewSidequestRequestProcedure>
export type ReviewSidequestRequestOutput = inferProcedureOutput<typeof reviewSidequestRequestProcedure>
const reviewSidequestRequestProcedure = procedure
  .input(
    z.object({
      id: SidequestRequestSchema.shape.id,
      review: SidequestRequestReviewWriteSchema,
    })
  )
  .output(SidequestSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const sidequestRequest = await ctx.sidequestService.reviewRequest(
      ctx.handle,
      input.id,
      ctx.principal.subject,
      input.review
    )

    ctx.setAuditTransactionName(
      `Review SidequestRequest(ID=${sidequestRequest.request?.id},Title=${sidequestRequest.title},Status=${input.review.status})`
    )

    return sidequestRequest
  })

export const sidequestRouter = t.router({
  create: createSidequestProcedure,
  update: updateSidequestProcedure,
  findById: findSidequestProcedure,
  getById: getSidequestProcedure,
  getByIdWithRequest: getSidequestByIdWithRequestProcedure,
  findMany: findManySidequestsProcedure,
  findManyWithRequest: findManySidequestsWithRequestProcedure,
  findManyWithRequestByInterestGroupId: findManySidequestsWithRequestByInterestGroupIdProcedure,
  findRegistrations: findSidequestRegistrationsProcedure,
  createFileUpload: createSidequestFileUploadProcedure,
  createFileUploadForGroup: createSidequestFileUploadForGroupProcedure,
  createRegistration: createSidequestRegistrationProcedure,
  deleteRegistration: deleteSidequestRegistrationProcedure,
  createRequest: createSidequestRequestProcedure,
  reviewRequest: reviewSidequestRequestProcedure,
})

type SidequestAccess = {
  principal: Principal | null
  authorizationService: AuthorizationService
  sidequestService: SidequestService
  handle: DBHandle
}

function canSeeUnpublished(ctx: SidequestAccess) {
  if (ctx.principal === null) {
    return false
  }

  return (
    ctx.authorizationService.isAdministrator(ctx.principal.affiliations) ||
    ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, [CommitteeGroupSlug.BACKLOG])
  )
}

async function canAccessSidequest(ctx: SidequestAccess, sidequest: SidequestSummary) {
  if (sidequest.status === SidequestStatusSchema.enum.PUBLISHED) {
    return true
  }

  if (canSeeUnpublished(ctx)) {
    return true
  }

  if (sidequest.status === SidequestStatusSchema.enum.DELETED) {
    return false
  }

  if (ctx.principal === null) {
    return false
  }

  const roles = ctx.principal.affiliations.get(sidequest.interestGroupId)
  if (roles?.has(GroupRoleTypeEnum.LEADER) === true) {
    return true
  }

  const sidequestWithRequest = await ctx.sidequestService.findByIdWithRequest(ctx.handle, sidequest.id, false)
  if (
    sidequestWithRequest !== null &&
    sidequestWithRequest.request !== null &&
    sidequestWithRequest.request.requestedById === ctx.principal.subject
  ) {
    return true
  }

  return false
}

function stripReviewerIdentity(item: SidequestSummaryWithRequest) {
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
