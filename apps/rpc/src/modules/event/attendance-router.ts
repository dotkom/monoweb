import { on } from "node:events"
import { TZDate } from "@date-fns/tz"
import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  type Attendee,
  AttendeeSchema,
  AttendeeSelectionResponseSchema,
  DeregisterReasonTypeSchema,
  UserSchema,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { TRPCError } from "@trpc/server"
import { addDays } from "date-fns"
import { z } from "zod"
import { FailedPreconditionError } from "../../error"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  createPool: staffProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        input: AttendancePoolWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.attendanceService.createAttendancePool(handle, input.id, input.input)
      )
    }),

  updatePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceByPoolId(handle, input.id)
        const pool = attendance.pools.find((pool) => pool.id === input.id)
        if (pool === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        await ctx.attendanceService.updateAttendancePool(handle, input.id, { ...pool, ...input.input })
      })
    }),

  deletePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.attendanceService.deleteAttendancePool(handle, input.id)
      )
    }),

  adminRegisterForEvent: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        attendancePoolId: AttendancePoolSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const result = await ctx.attendanceService.getRegistrationAvailability(
          handle,
          input.attendanceId,
          input.userId,
          {
            ignoreRegistrationWindow: true,
            immediateReservation: true,
            immediatePayment: false,
            overriddenAttendancePoolId: input.attendancePoolId,
            ignoreRegisteredToParent: true,
          }
        )
        if (!result.success) {
          throw new FailedPreconditionError(`Failed to register: ${result.cause}`)
        }
        return await ctx.attendanceService.registerAttendee(handle, result)
      })
    }),

  updateAttendancePayment: staffProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        price: z.number().int().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceById(handle, input.id)
        if (attendance === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        return ctx.attendanceService.updateAttendancePaymentPrice(handle, input.id, input.price)
      })
    }),

  getSelectionsResults: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceById(handle, input.attendanceId)
        const allSelectionResponses = attendance.attendees.flatMap((attendee) => attendee.selections)

        return attendance.selections.map((selection) => {
          const selectionResponses = allSelectionResponses.filter((response) => response.selectionId === selection.id)

          return {
            id: selection.id,
            name: selection.name,
            totalCount: selectionResponses.length,
            options: selection.options.map((option) => ({
              id: option.id,
              name: option.name,
              count: selectionResponses.filter((response) => response.optionId === option.id).length,
            })),
          }
        })
      })
    }),

  getRegistrationAvailability: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.attendanceService.getRegistrationAvailability(
          handle,
          input.attendanceId,
          ctx.principal.subject,
          {
            ignoreRegistrationWindow: false,
            immediateReservation: false,
            immediatePayment: true,
            overriddenAttendancePoolId: null,
            ignoreRegisteredToParent: false,
          }
        )
      })
    ),

  registerForEvent: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        const result = await ctx.attendanceService.getRegistrationAvailability(
          handle,
          input.attendanceId,
          ctx.principal.subject,
          {
            ignoreRegistrationWindow: false,
            immediateReservation: false,
            immediatePayment: true,
            overriddenAttendancePoolId: null,
            ignoreRegisteredToParent: false,
          }
        )
        if (!result.success) {
          throw new FailedPreconditionError(`Failed to register: ${result.cause}`)
        }
        return await ctx.attendanceService.registerAttendee(handle, result)
      })
    ),

  onRegisterChange: procedure
    .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
    .subscription(async function* ({ input, ctx, signal }) {
      for await (const [data] of on(ctx.eventEmitter, "attendance:register-change", { signal })) {
        const attendeeUpdateData = data as { attendee: Attendee; status: "registered" | "deregistered" }

        if (attendeeUpdateData.attendee.attendanceId !== input.attendanceId) {
          continue
        }

        yield attendeeUpdateData
      }
    }),

  cancelAttendeePayment: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input: { attendeeId }, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.attendanceService.cancelAttendeePayment(handle, attendeeId, ctx.principal.subject)
      )
    }),
  startAttendeePayment: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input: { attendeeId }, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.attendanceService.startAttendeePayment(handle, attendeeId, addDays(getCurrentUTC(), 1))
      )
    }),
  deregisterForEvent: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendancePoolSchema.shape.id,
        deregisterReason: z.object({
          type: DeregisterReasonTypeSchema,
          details: z.string().nullable(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceById(handle, input.attendanceId)
        const attendee = attendance.attendees.find((attendee) => attendee.user.id === ctx.principal.subject)
        if (attendee === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        await ctx.attendanceService.deregisterAttendee(handle, attendee.id, {
          ignoreDeregistrationWindow: false,
        })

        const event = await ctx.eventService.getByAttendanceId(handle, attendance.id)
        await ctx.eventService.createDeregisterReason(handle, {
          ...input.deregisterReason,
          userId: ctx.principal.subject,
          eventId: event.id,
          registeredAt: attendee.createdAt,
          userGrade: attendee.userGrade,
        })
      })
    }),

  adminDeregisterForEvent: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(handle, input.attendeeId)
        const attendee = attendance.attendees.find((attendee) => attendee.id === input.attendeeId)
        if (attendee === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        return await ctx.attendanceService.deregisterAttendee(handle, attendee.id, {
          ignoreDeregistrationWindow: true,
        })
      })
    }),

  adminUpdateAtteendeeReserved: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        reserved: AttendeeSchema.shape.reserved,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        await ctx.attendanceService.updateAttendeeById(handle, input.attendeeId, { reserved: input.reserved })
      })
    }),

  registerAttendance: staffProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        at: z.coerce.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        await ctx.attendanceService.registerAttendance(handle, input.id, input.at ? new TZDate(input.at) : null)
      })
    }),

  updateSelectionResponses: authenticatedProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        options: AttendeeSelectionResponseSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        await ctx.attendanceService.updateAttendeeById(handle, input.attendeeId, { selections: input.options })
      })
    }),

  getAttendance: procedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.attendanceService.getAttendanceById(handle, input.id))
    ),

  updateAttendance: staffProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) =>
        ctx.attendanceService.updateAttendanceById(handle, input.id, input.attendance)
      )
    ),

  findChargeAttendeeScheduleDate: authenticatedProcedure
    .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
    .output(z.date().nullable())
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendee = await ctx.attendanceService.getAttendeeById(handle, input.attendeeId)

        ctx.authorize.requireMeOrAffiliation(attendee.userId, ["dotkom", "hs"])

        return await ctx.attendanceService.findChargeAttendeeScheduleDate(handle, attendee.id)
      })
    }),
})
