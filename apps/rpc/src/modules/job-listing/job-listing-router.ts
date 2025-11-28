import {
  CompanySchema,
  JobListingFilterQuerySchema,
  JobListingLocationSchema,
  JobListingSchema,
  JobListingWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: staffProcedure
    .input(
      z.object({
        input: JobListingWriteSchema,
        companyId: CompanySchema.shape.id,
        locationIds: z.array(JobListingLocationSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        return ctx.jobListingService.create(handle, input.input, input.companyId, input.locationIds)
      })
    ),
  edit: staffProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema.partial(),
        companyId: CompanySchema.shape.id,
        locationIds: z.array(JobListingLocationSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) =>
        ctx.jobListingService.update(handle, input.id, input.input, input.companyId, input.locationIds)
      )
    ),
  findMany: procedure
    .input(BasePaginateInputSchema.extend({ filter: JobListingFilterQuerySchema.optional() }).default({}))
    .query(async ({ input, ctx }) => {
      const { filter, ...page } = input
      const jobListings = await ctx.executeTransaction(async (handle) =>
        ctx.jobListingService.findMany(handle, { ...filter }, page)
      )

      return {
        items: jobListings,
        nextCursor: jobListings.at(-1)?.id,
      }
    }),
  active: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.getActive(handle, input))
    ),
  get: procedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.getById(handle, input))
    ),
  find: procedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.findById(handle, input))
    ),

  getLocations: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.jobListingService.getLocations(handle))
  ),
})
