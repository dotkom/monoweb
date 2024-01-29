import { AttendanceSchema, AttendanceWriteSchema, EventSchema, UserSchema } from "@dotkomonline/types"
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
  registerForEvent: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        poolId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.registerForEvent(input.userId, input.poolId)
      return res
    }),
  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.deregisterAttendee(input.userId, input.attendanceId)
      return res
    }),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        attendanceId: z.string(),
        attended: z.boolean(),
      })
    )
    .mutation(
      async ({ input, ctx }) =>
        await ctx.attendanceService.registerForAttendance(input.userId, input.attendanceId, input.attended)
    ),
  createWaitlist: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.eventService.createWaitlist(input.eventId)),
  addChoice: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
        attendanceId: z.string(),
        questionId: z.string(),
        choiceId: z.string(),
      })
    )
    .mutation(
      async ({ input, ctx }) =>
        await ctx.attendanceService.addChoice(input.eventId, input.attendanceId, input.questionId, input.choiceId)
    ),
})
