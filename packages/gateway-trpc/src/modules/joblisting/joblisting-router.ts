import { PaginateInputSchema } from "@dotkomonline/core"
import { JobListingSchema, JobListingWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const jobListingRouter = t.router({
  create: t.procedure.input(JobListingWriteSchema).mutation(({ input, ctx }) => {
    return ctx.jobListingService.create(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: JobListingSchema.shape.id,
        input: JobListingWriteSchema,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.jobListingService.update(changes.id, changes.input)
    }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.jobListingService.getAll(input.take, input.cursor)
  }),
  get: t.procedure.input(JobListingSchema.shape.id).query(({ input, ctx }) => {
    return ctx.jobListingService.get(input)
  }),
  getLocations: t.procedure.input(PaginateInputSchema).query(({ ctx }) => {
    return ctx.jobListingService.getLocations()
  }),
  getEmploymentTypes: t.procedure.input(PaginateInputSchema).query(({ ctx }) => {
    return ctx.jobListingService.getEmploymentTypes()
  }),
})
