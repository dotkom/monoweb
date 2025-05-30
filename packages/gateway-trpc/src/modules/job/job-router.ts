import { JobSchema, JobWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, t } from "../../trpc"

export const jobRouter = t.router({
  create: adminProcedure.input(JobWriteSchema).mutation(async ({ input, ctx }) => await ctx.jobService.create(input)),
  edit: adminProcedure
    .input(
      z.object({
        id: JobSchema.shape.id,
        input: JobWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.jobService.update(input.id, input.input)),
  delete: adminProcedure
    .input(JobSchema.shape.id)
    .mutation(async ({ input, ctx }) => await ctx.jobService.delete(input)),
  getById: adminProcedure
    .input(JobSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.jobService.getById(input)),
  getScheduledJobById: adminProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => await ctx.jobService.getScheduledJobById(input)),
  getScheduledJob: adminProcedure
    .input(JobSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.jobService.getScheduledJob(input)),
  getScheduledJobByScheduledTaskId: adminProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => await ctx.jobService.getScheduledJobByScheduledTaskId(input)),
  getAllScheduledJobs: adminProcedure.query(async ({ ctx }) => await ctx.jobService.getAllScheduledJobs()),
  scheduleJob: adminProcedure.input(JobWriteSchema).mutation(async ({ input, ctx }) => {
    const job = (await ctx.jobService.create(input)).into()
    ctx.jobService.scheduleJob(job)
  }),
  createAndScheduleJob: adminProcedure
    .input(JobWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.jobService.createAndScheduleJob(input)),
  scheduleEnabledJobs: adminProcedure.mutation(async ({ ctx }) => await ctx.jobService.scheduleEnabledJobs()),
  cancelScheduledJob: adminProcedure.input(JobSchema.shape.id).mutation(async ({ input, ctx }) => {
    await ctx.jobService.cancelScheduledJob(input)
  }),
  cancelScheduledJobByScheduledTaskId: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    await ctx.jobService.cancelScheduledJobByScheduledTaskId(input)
  }),
})
