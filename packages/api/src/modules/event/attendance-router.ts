import { AttendanceWriteSchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  create: protectedProcedure.input(AttendanceWriteSchema).mutation(async ({ input, ctx }) => {
    const attendance = await ctx.eventService.createAttendance(input.eventId, input)
    return attendance
  }),
  get: publicProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      const attendance = await ctx.eventService.listAttendance(input.eventId)
      return attendance
    }),
  attend: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.registerForEvent(ctx.auth.userId, input.eventId)
      return res
    }),
  createWaitlist: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.eventService.createWaitlist(input.eventId)
    }),
})
