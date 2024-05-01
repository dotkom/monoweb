import { PaginateInputSchema } from "@dotkomonline/core"
import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: t.procedure
    .input(JobListingWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.jobListingService.createJobListing(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.jobListingService.updateJobListingById(changes.id, changes.input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.jobListingService.getAll(input.take, input.cursor)),
  get: t.procedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.jobListingService.getById(input)),
  getLocations: t.procedure.input(PaginateInputSchema).query(async ({ ctx }) => ctx.jobListingService.getLocations()),
})
