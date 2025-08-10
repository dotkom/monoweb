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
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  getAttendee: authenticatedProcedure
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

  createPool: staffProcedure.input(AttendancePoolWriteSchema).mutation(async ({ input, ctx }) => {
    return ctx.executeTransaction(async (handle) => ctx.attendanceService.createPool(handle, input))
  }),

  updatePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: { id, input }, ctx }) => {
      return ctx.executeTransaction(async (handle) => ctx.attendanceService.updatePool(handle, id, input))
    }),

  deletePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => ctx.attendanceService.deletePool(handle, input.id))
    }),

  adminRegisterForEvent: staffProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.adminRegisterForEvent(handle, input.userId, input.attendanceId, input.attendancePoolId)
      )
    }),

  registerForEvent: authenticatedProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.registerForEvent(handle, ctx.principal.subject, input.attendanceId, input.attendancePoolId)
      )
    ),

  refundAttendee: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input: { attendeeId }, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.refundAttendee(handle, attendeeId, ctx.principal.subject)
      )
    }),

  deregisterForEvent: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.tryDeregisterForEvent(handle, ctx.principal.subject, input.attendanceId)
      )
    }),

  adminDeregisterForEvent: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        reserveNextAttendee: z.boolean(),
        bypassCriteriaOnReserveNextAttendee: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.deregisterForEvent(handle, input.attendeeId, {
          reserveNextAttendee: input.reserveNextAttendee,
          bypassCriteriaOnReserveNextAttendee: input.bypassCriteriaOnReserveNextAttendee,
        })
      )
    }),

  getSelectionsResults: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.getSelectionsResponseSummary(handle, input.attendanceId)
      )
    }),

  registerAttendance: staffProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.updateAttended(handle, input.id, input.attended)
      )
    }),

  updateSelectionResponses: authenticatedProcedure
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

  getAttendees: procedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.attendeeService.getByAttendanceId(handle, input.attendanceId))
    ),

  getAttendance: procedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.attendanceService.getById(handle, input.id))
    ),

  updateAttendance: authenticatedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.attendanceService.update(handle, input.id, input.attendance))
    ),

  mergeAttendancePools: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        attendancePool: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.mergeAttendancePools(handle, input.attendanceId, input.attendancePool)
      )
    }),

  getSelectionResponseResults: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.getSelectionsResponseSummary(handle, input.attendanceId)
      )
    }),

  getAttendeeStatuses: authenticatedProcedure
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

  removeSelectionResponses: staffProcedure
    .input(
      z.object({
        selectionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendeeService.removeSelectionResponses(handle, input.selectionId)
      )
    }),
})
