import { PaginateInputSchema } from "@dotkomonline/core"
import { JobListingSchema, JobListingWithLocationWriteSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: t.procedure
    .input(JobListingWithLocationWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.jobListingService.create(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        data: JobListingWithLocationWriteSchema.partial()
      })
    )
    .mutation(async ({ input: { id, data }, ctx }) => ctx.jobListingService.update(id, data)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.jobListingService.getAll(input.take, input.cursor)),
  get: t.procedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.jobListingService.getById(input)),
  getLocations: t.procedure.input(PaginateInputSchema).query(async ({ ctx }) => ctx.jobListingService.getLocations()),
})
