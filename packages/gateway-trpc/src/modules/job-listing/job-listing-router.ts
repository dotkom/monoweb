import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, JobListingLocationSchema, JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: adminProcedure
    .input(
      z.object({
        input: JobListingWriteSchema,
        companyId: CompanySchema.shape.id,
        locationIds: z.array(JobListingLocationSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.jobListingService.create(handle, input.input, input.companyId, input.locationIds)
      )
    ),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema.partial(),
        companyId: CompanySchema.shape.id,
        locationIds: z.array(JobListingLocationSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.jobListingService.update(handle, input.id, input.input, input.companyId, input.locationIds)
      )
    ),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.getAll(handle, input))
    ),
  active: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.getActive(handle, input))
    ),
  get: publicProcedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.jobListingService.getById(handle, input))
    ),
  getLocations: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.jobListingService.getLocations(handle))
  ),
})
