import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import z from "zod"
import { permitIf } from "../../authorization"
import { InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import {
  canAdminManageSidequests,
  canManageSidequestRequestsForGroup,
  canSeeUnpublishedSidequests,
  canViewSidequest,
} from "../../permissions/sidequest-permissions"
import { procedure, t } from "../../trpc"
import { GroupSchema, GroupTypeSchema } from "../group/group"
import {
  buildSidequestView,
  RequestedSidequestWriteSchema,
  SidequestFilterQuerySchema,
  SidequestRegistrationSchema,
  SidequestRequestReviewWriteSchema,
  SidequestRequestSchema,
  SidequestRequestWriteSchema,
  SidequestSchema,
  SidequestStatusSchema,
  SidequestSummaryWithRequestSchema,
  SidequestViewSchema,
  SidequestWriteSchema,
  type SidequestSummaryWithRequest,
} from "./sidequest"

const createSidequestProcedure = procedure
  .input(
    z.object({
      sidequest: SidequestWriteSchema,
    })
  )
  .output(SidequestViewSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canAdminManageSidequests)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.create(ctx.handle, input.sidequest, ctx.principal.subject)
    ctx.setAuditTransactionName(`Create Sidequest(ID=${sidequest.id},Title=${sidequest.title})`)

    return buildSidequestView(sidequest, ctx.principal.subject)
  })

const updateSidequestProcedure = procedure
  .input(
    z.object({
      id: SidequestSchema.shape.id,
      sidequest: SidequestWriteSchema.partial(),
    })
  )
  .output(SidequestViewSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canAdminManageSidequests)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.update(ctx.handle, input.id, input.sidequest, ctx.principal.subject)
    ctx.setAuditTransactionName(`Update Sidequest(ID=${sidequest.id},Title=${sidequest.title})`)

    return buildSidequestView(sidequest, ctx.principal.subject)
  })

const findSidequestProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(SidequestViewSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.findById(ctx.handle, input.sidequestId, ctx.principal !== null)
    if (sidequest === null || !canViewSidequest(ctx.principal, sidequest)) {
      return null
    }

    return buildSidequestView(sidequest, ctx.principal?.subject ?? null)
  })

const getSidequestProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(SidequestViewSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input.sidequestId, ctx.principal !== null)

    if (!canViewSidequest(ctx.principal, sidequest)) {
      throw new NotFoundError(`Sidequest(ID=${input.sidequestId}) not found`)
    }

    return buildSidequestView(sidequest, ctx.principal?.subject ?? null)
  })

const findManySidequestsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: SidequestFilterQuerySchema.optional() }))
  .output(
    z.object({
      items: SidequestViewSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const canSeeNonPublished = canSeeUnpublishedSidequests(ctx.principal)

    const filter = {
      ...input.filter,
      byStatus: canSeeNonPublished ? input.filter?.byStatus : [SidequestStatusSchema.enum.PUBLISHED],
    }

    const items = await ctx.sidequestService.findMany(ctx.handle, filter, input, ctx.principal !== null)

    return {
      items: items.map((item) => buildSidequestView(item, ctx.principal?.subject ?? null)),
      nextCursor: items.at(-1)?.id,
    }
  })

const registerForSidequestProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(SidequestRegistrationSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input.sidequestId, false)
    const user = await ctx.userService.getById(ctx.handle, userId)

    if (!canViewSidequest(ctx.principal, sidequest)) {
      throw new NotFoundError(`Sidequest(ID=${input.sidequestId}) not found`)
    }

    const createdRegistration = await ctx.sidequestService.createRegistration(ctx.handle, input.sidequestId, userId)
    ctx.setAuditTransactionName(
      `Register User(ID=${userId},Name=${user.name}) for Sidequest(ID=${input.sidequestId},Title=${sidequest.title})`
    )

    return createdRegistration
  })

const deregisterFromSidequestProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(z.void())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const user = await ctx.userService.getById(ctx.handle, userId)
    const sidequest = await ctx.sidequestService.getById(ctx.handle, input.sidequestId, false)

    if (!canViewSidequest(ctx.principal, sidequest)) {
      throw new NotFoundError(`Sidequest(ID=${input.sidequestId}) not found`)
    }

    await ctx.sidequestService.deleteRegistration(ctx.handle, input.sidequestId, userId)
    ctx.setAuditTransactionName(
      `Deregister User(ID=${userId},Name=${user.name}) from Sidequest(ID=${input.sidequestId},Title=${sidequest.title})`
    )
  })

const findSidequestRegistrationsProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(SidequestRegistrationSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canAdminManageSidequests)))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.sidequestService.getById(ctx.handle, input.sidequestId, false)

    return ctx.sidequestService.findRegistrations(ctx.handle, input.sidequestId)
  })

const createSidequestFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
      interestGroupId: GroupSchema.shape.slug.optional(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const { interestGroupId } = input

    if (interestGroupId === undefined) {
      await ctx.addAuthorizationGuard(
        permitIf((principal) => canAdminManageSidequests(principal)),
        input
      )
    } else {
      await ctx.addAuthorizationGuard(
        permitIf((principal) => canManageSidequestRequestsForGroup(principal, interestGroupId)),
        input
      )

      const group = await ctx.groupService.getBySlug(ctx.handle, interestGroupId)
      if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(`Group(Slug=${interestGroupId}) is not an interest group`)
      }
    }

    return ctx.sidequestService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

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
      permitIf((principal) => canManageSidequestRequestsForGroup(principal, input.interestGroupId)),
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

const reviewSidequestRequestProcedure = procedure
  .input(
    z.object({
      id: SidequestRequestSchema.shape.id,
      review: SidequestRequestReviewWriteSchema,
    })
  )
  .output(SidequestSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canAdminManageSidequests)))
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

const getSidequestByIdWithRequestProcedure = procedure
  .input(
    z.object({
      sidequestId: SidequestSchema.shape.id,
    })
  )
  .output(SidequestSummaryWithRequestSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const sidequest = await ctx.sidequestService.getByIdWithRequest(ctx.handle, input.sidequestId, true)

    const group = await ctx.groupService.getBySlug(ctx.handle, sidequest.interestGroupId)
    if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
      throw new InvalidArgumentError(`Group(Slug=${sidequest.interestGroupId}) is not an interest group`)
    }

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageSidequestRequestsForGroup(principal, sidequest.interestGroupId)),
      input
    )

    if (!canViewSidequest(ctx.principal, sidequest)) {
      throw new NotFoundError(`Sidequest(ID=${input.sidequestId}) not found`)
    }

    if (canAdminManageSidequests(ctx.principal)) {
      return sidequest
    }

    return stripReviewerIdentity(sidequest)
  })

const findManySidequestsWithRequestProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      filter: SidequestFilterQuerySchema.optional(),
      interestGroupId: GroupSchema.shape.slug.optional(),
    })
  )
  .output(
    z.object({
      items: SidequestSummaryWithRequestSchema.array(),
      nextCursor: z.string().optional(),
    })
  )
  .use(withDatabaseTransaction())
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const { interestGroupId } = input

    let filter = input.filter ?? {}

    if (interestGroupId === undefined || interestGroupId === "") {
      await ctx.addAuthorizationGuard(
        permitIf((principal) => canAdminManageSidequests(principal)),
        input
      )
    } else {
      await ctx.addAuthorizationGuard(
        permitIf((principal) => canManageSidequestRequestsForGroup(principal, interestGroupId)),
        input
      )

      const group = await ctx.groupService.getBySlug(ctx.handle, interestGroupId)
      if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
        throw new InvalidArgumentError(`Group(Slug=${interestGroupId}) is not an interest group`)
      }

      // Interest group leader can only see sidequests for their own group
      filter = {
        ...filter,
        byInterestGroupId: [interestGroupId],
      }
    }

    const items = await ctx.sidequestService.findManyWithRequest(ctx.handle, filter, input, true)
    const canSeeReviewerIdentity = canAdminManageSidequests(ctx.principal)

    return {
      items: canSeeReviewerIdentity ? items : items.map(stripReviewerIdentity),
      nextCursor: items.at(-1)?.id,
    }
  })

export const sidequestRouter = t.router({
  create: createSidequestProcedure,
  update: updateSidequestProcedure,
  findById: findSidequestProcedure,
  getById: getSidequestProcedure,
  findMany: findManySidequestsProcedure,
  register: registerForSidequestProcedure,
  deregister: deregisterFromSidequestProcedure,
  findRegistrations: findSidequestRegistrationsProcedure,
  createFileUpload: createSidequestFileUploadProcedure,
  createRequest: createSidequestRequestProcedure,
  reviewRequest: reviewSidequestRequestProcedure,
  getByIdWithRequest: getSidequestByIdWithRequestProcedure,
  findManyWithRequest: findManySidequestsWithRequestProcedure,
})

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
