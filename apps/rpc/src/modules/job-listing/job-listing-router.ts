import {
  CompanySchema,
  JobListingFilterQuerySchema,
  JobListingLocationSchema,
  JobListingSchema,
  JobListingWriteSchema,
} from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

export type CreateJobListingInput = inferProcedureInput<typeof createJobListingProcedure>
export type CreateJobListingOutput = inferProcedureOutput<typeof createJobListingProcedure>
const createJobListingProcedure = procedure
  .input(
    z.object({
      input: JobListingWriteSchema,
      companyId: CompanySchema.shape.id,
      locationIds: z.array(JobListingLocationSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.jobListingService.create(ctx.handle, input.companyId, input.input, input.locationIds)
  })

export type EditJobListingInput = inferProcedureInput<typeof editJobListingProcedure>
export type EditJobListingOutput = inferProcedureOutput<typeof editJobListingProcedure>
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.jobListingService.update(ctx.handle, input.id, input.input, input.locationIds)
  })

export type FindManyJobListingsInput = inferProcedureInput<typeof findManyJobListingsProcedure>
export type FindManyJobListingsOutput = inferProcedureOutput<typeof findManyJobListingsProcedure>
const findManyJobListingsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: JobListingFilterQuerySchema.optional() }).default({}))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input
    const jobListings = await ctx.jobListingService.findMany(ctx.handle, { ...filter }, page)

    return {
      items: jobListings,
      nextCursor: jobListings.at(-1)?.id,
    }
  })

export type ActiveJobListingsInput = inferProcedureInput<typeof activeJobListingsProcedure>
export type ActiveJobListingsOutput = inferProcedureOutput<typeof activeJobListingsProcedure>
const activeJobListingsProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.jobListingService.findActiveJobListings(ctx.handle, input)
  })

export type GetJobListingInput = inferProcedureInput<typeof getJobListingProcedure>
export type GetJobListingOutput = inferProcedureOutput<typeof getJobListingProcedure>
const getJobListingProcedure = procedure
  .input(JobListingSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.jobListingService.getById(ctx.handle, input)
  })

export type FindJobListingInput = inferProcedureInput<typeof findJobListingProcedure>
export type FindJobListingOutput = inferProcedureOutput<typeof findJobListingProcedure>
const findJobListingProcedure = procedure
  .input(JobListingSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.jobListingService.findById(ctx.handle, input)
  })

export type GetJobListingLocationsInput = inferProcedureInput<typeof getJobListingLocationsProcedure>
export type GetJobListingLocationsOutput = inferProcedureOutput<typeof getJobListingLocationsProcedure>
const getJobListingLocationsProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  return ctx.jobListingService.findJobListingLocations(ctx.handle)
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
