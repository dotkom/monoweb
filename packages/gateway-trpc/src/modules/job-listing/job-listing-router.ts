import { PaginateInputSchema } from "@dotkomonline/core"
import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: adminProcedure
    .input(JobListingWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.jobListingService.create(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: { id, input }, ctx }) => ctx.jobListingService.update(id, input)),
  all: adminProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.jobListingService.getAll(input)),
  active: adminProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.jobListingService.getActive(input)),
  get: adminProcedure
    .input(JobListingSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.jobListingService.getById(input)),
  getLocations: adminProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx }) => ctx.jobListingService.getLocations()),
})
