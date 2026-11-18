import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { canManageJobListings } from "../../permissions/job-listing-permissions"
import { procedure, t } from "../../trpc"
import { CompanySchema } from "../company/company"
import {
  JobListingFilterQuerySchema,
  JobListingLocationSchema,
  JobListingSchema,
  JobListingWriteSchema,
} from "./job-listing"

const createJobListingProcedure = procedure
  .input(
    z.object({
      input: JobListingWriteSchema,
      companyId: CompanySchema.shape.id,
      locationIds: z.array(JobListingLocationSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageJobListings)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdJobListing = await ctx.jobListingService.create(
      ctx.handle,
      input.companyId,
      input.input,
      input.locationIds
    )

    ctx.setAuditTransactionName(`Create JobListing(ID=${createdJobListing.id},Title=${createdJobListing.title})`)

    return createdJobListing
  })

const editJobListingProcedure = procedure
  .input(
    z.object({
      id: JobListingSchema.shape.id,
      input: JobListingWriteSchema.partial(),
      companyId: CompanySchema.shape.id,
      locationIds: z.array(JobListingLocationSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageJobListings)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedJobListing = await ctx.jobListingService.update(ctx.handle, input.id, input.input, input.locationIds)

    ctx.setAuditTransactionName(`Update JobListing(ID=${updatedJobListing.id},Title=${updatedJobListing.title})`)

    return updatedJobListing
  })

const findManyJobListingsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: JobListingFilterQuerySchema.optional() }).prefault({}))
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input
    const jobListings = await ctx.jobListingService.findMany(ctx.prisma, { ...filter }, page)

    return {
      items: jobListings,
      nextCursor: jobListings.at(-1)?.id,
    }
  })

const activeJobListingsProcedure = procedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
  return ctx.jobListingService.findActiveJobListings(ctx.prisma, input)
})

const getJobListingProcedure = procedure.input(JobListingSchema.shape.id).query(async ({ input, ctx }) => {
  return ctx.jobListingService.getById(ctx.prisma, input)
})

const findJobListingProcedure = procedure.input(JobListingSchema.shape.id).query(async ({ input, ctx }) => {
  return ctx.jobListingService.findById(ctx.prisma, input)
})

const getJobListingLocationsProcedure = procedure.query(async ({ ctx }) => {
  return ctx.jobListingService.findJobListingLocations(ctx.prisma)
})

export const jobListingRouter = t.router({
  create: createJobListingProcedure,
  edit: editJobListingProcedure,
  findMany: findManyJobListingsProcedure,
  active: activeJobListingsProcedure,
  get: getJobListingProcedure,
  find: findJobListingProcedure,
  getLocations: getJobListingLocationsProcedure,
})
