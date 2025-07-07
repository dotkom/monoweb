import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  AttendeeSelectionResponsesSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  getAttendee: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.getByUserId(handle, input.userId, input.attendanceId)
      )
    ),

  createPool: adminProcedure
    .input(AttendancePoolWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.createPool(handle, input)
      )
    ),

  updatePool: adminProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: { id, input }, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.updatePool(handle, id, input)
      )
    ),

  deletePool: adminProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.deletePool(handle, input.id)
      )
    ),

  adminRegisterForEvent: adminProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.adminRegisterForEvent(handle, input.userId, input.attendanceId, input.attendancePoolId)
      )
    ),

  registerForEvent: protectedProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.registerForEvent(handle, ctx.principal, input.attendanceId, input.attendancePoolId)
      )
    ),

  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.deregisterForEvent(handle, ctx.principal, input.attendanceId)
      )
    ),

  adminDeregisterForEvent: adminProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        reserveNextAttendee: z.boolean(),
        bypassCriteriaOnReserveNextAttendee: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.adminDeregisterForEvent(handle, input.attendeeId, {
          reserveNextAttendee: input.reserveNextAttendee,
          bypassCriteriaOnReserveNextAttendee: input.bypassCriteriaOnReserveNextAttendee,
        })
      )
    ),

  getSelectionsResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.getSelectionsResponseSummary(handle, input.attendanceId)
      )
    ),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.updateAttended(handle, input.id, input.attended)
      )
    ),

  updateSelectionResponses: protectedProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        options: AttendeeSelectionResponsesSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.updateSelectionResponses(handle, input.attendeeId, input.options)
      )
    ),

  getAttendees: publicProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.getByAttendanceId(handle, input.attendanceId)
      )
    ),

  getAttendance: publicProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.getById(handle, input.id)
      )
    ),

  updateAttendance: adminProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.update(handle, input.id, input.attendance)
      )
    ),

  mergeAttendancePools: adminProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        attendancePool: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.mergeAttendancePools(handle, input.attendanceId, input.attendancePool)
      )
    ),

  getSelectionResponseResults: adminProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.getSelectionsResponseSummary(handle, input.attendanceId)
      )
    ),

  getAttendeeStatuses: adminProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendanceIds: z.array(AttendanceSchema.shape.id),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.getAttendeeStatuses(handle, input.userId, input.attendanceIds)
      )
    ),

  removeSelectionResponses: adminProcedure
    .input(
      z.object({
        selectionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.removeSelectionResponses(handle, input.selectionId)
      )
    ),
})