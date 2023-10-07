import { AttendanceWriteSchema, EventSchema } from "@dotkomonline/types";
import { z } from "zod";

import { protectedProcedure, publicProcedure, t } from "../../trpc";

export const attendanceRouter = t.router({
  attend: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.attendanceService.registerForEvent(ctx.auth.userId, input.eventId);

      return res;
    }),
  create: protectedProcedure.input(AttendanceWriteSchema).mutation(async ({ ctx, input }) => {
    const attendance = await ctx.eventService.createAttendance(input.eventId, input);

    return attendance;
  }),
  createWaitlist: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) => await ctx.eventService.createWaitlist(input.eventId)),
  get: publicProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .query(async ({ ctx, input }) => {
      const attendance = await ctx.eventService.listAttendance(input.eventId);

      return attendance;
    }),
});
