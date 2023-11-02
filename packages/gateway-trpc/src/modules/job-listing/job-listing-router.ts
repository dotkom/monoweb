import { PaginateInputSchema } from "@dotkomonline/core"
import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: t.procedure
    .input(JobListingWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.jobListingService.create(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.jobListingService.update(changes.id, changes.input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.jobListingService.getAll(input.take, input.cursor)),
  get: t.procedure.input(JobListingSchema.shape.id).query(async ({ input, ctx }) => ctx.jobListingService.get(input)),
  getLocations: t.procedure.input(PaginateInputSchema).query(async ({ ctx }) => ctx.jobListingService.getLocations()),
})
