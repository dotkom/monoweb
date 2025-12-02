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
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { TRPCError } from "@trpc/server"
import { addHours, max } from "date-fns"
import { z } from "zod"
import { isAdministrator, isEditor, isSameSubject, or } from "../../authorization"
import { FailedPreconditionError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"

export type CreatePoolInput = inferProcedureInput<typeof createPoolProcedure>
export type CreatePoolOutput = inferProcedureOutput<typeof createPoolProcedure>
const createPoolProcedure = procedure
  .input(
    z.object({
      id: AttendanceSchema.shape.id,
      input: AttendancePoolWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.attendanceService.createAttendancePool(ctx.handle, input.id, input.input)
  })

export type UpdatePoolInput = inferProcedureInput<typeof updatePoolProcedure>
export type UpdatePoolOutput = inferProcedureOutput<typeof updatePoolProcedure>
const updatePoolProcedure = procedure
  .input(
    z.object({
      id: AttendancePoolSchema.shape.id,
      input: AttendancePoolWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByPoolId(ctx.handle, input.id)
    const pool = attendance.pools.find((pool) => pool.id === input.id)
    if (pool === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    await ctx.attendanceService.updateAttendancePool(ctx.handle, input.id, { ...pool, ...input.input })
  })

export type DeletePoolInput = inferProcedureInput<typeof deletePoolProcedure>
export type DeletePoolOutput = inferProcedureOutput<typeof deletePoolProcedure>
const deletePoolProcedure = procedure
  .input(
    z.object({
      id: AttendancePoolSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.attendanceService.deleteAttendancePool(ctx.handle, input.id)
  })

export type AdminRegisterForEventInput = inferProcedureInput<typeof adminRegisterForEventProcedure>
export type AdminRegisterForEventOutput = inferProcedureOutput<typeof adminRegisterForEventProcedure>
const adminRegisterForEventProcedure = procedure
  .input(
    z.object({
      attendanceId: AttendanceSchema.shape.id,
      attendancePoolId: AttendancePoolSchema.shape.id,
      userId: UserSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const result = await ctx.attendanceService.getRegistrationAvailability(
      ctx.handle,
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
    return await ctx.attendanceService.registerAttendee(ctx.handle, result)
  })

export type UpdateAttendancePaymentInput = inferProcedureInput<typeof updateAttendancePaymentProcedure>
export type UpdateAttendancePaymentOutput = inferProcedureOutput<typeof updateAttendancePaymentProcedure>
const updateAttendancePaymentProcedure = procedure
  .input(
    z.object({
      id: AttendanceSchema.shape.id,
      price: z.number().int().nullable(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.id)
    if (attendance === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return ctx.attendanceService.updateAttendancePaymentPrice(ctx.handle, input.id, input.price)
  })

export type GetSelectionsResultsInput = inferProcedureInput<typeof getSelectionsResultsProcedure>
export type GetSelectionsResultsOutput = inferProcedureOutput<typeof getSelectionsResultsProcedure>
const getSelectionsResultsProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.attendanceId)
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

export type GetRegistrationAvailabilityInput = inferProcedureInput<typeof getRegistrationAvailabilityProcedure>
export type GetRegistrationAvailabilityOutput = inferProcedureOutput<typeof getRegistrationAvailabilityProcedure>
const getRegistrationAvailabilityProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return await ctx.attendanceService.getRegistrationAvailability(
      ctx.handle,
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

export type RegisterForEventInput = inferProcedureInput<typeof registerForEventProcedure>
export type RegisterForEventOutput = inferProcedureOutput<typeof registerForEventProcedure>
const registerForEventProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const result = await ctx.attendanceService.getRegistrationAvailability(
      ctx.handle,
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
    return await ctx.attendanceService.registerAttendee(ctx.handle, result)
  })

export type OnRegisterChangeInput = inferProcedureInput<typeof onRegisterChangeProcedure>
export type OnRegisterChangeOutput = inferProcedureOutput<typeof onRegisterChangeProcedure>
const onRegisterChangeProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withDatabaseTransaction())
  .subscription(async function* ({ input, ctx, signal }) {
    for await (const [data] of on(ctx.eventEmitter, "attendance:register-change", { signal })) {
      const attendeeUpdateData = data as { attendee: Attendee; status: "registered" | "deregistered" }

      if (attendeeUpdateData.attendee.attendanceId !== input.attendanceId) {
        continue
      }

      yield attendeeUpdateData
    }
  })

export type CancelAttendeePaymentInput = inferProcedureInput<typeof cancelAttendeePaymentProcedure>
export type CancelAttendeePaymentOutput = inferProcedureOutput<typeof cancelAttendeePaymentProcedure>
const cancelAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: { attendeeId }, ctx }) => {
    return ctx.attendanceService.cancelAttendeePayment(ctx.handle, attendeeId, ctx.principal.subject)
  })

export type StartAttendeePaymentInput = inferProcedureInput<typeof startAttendeePaymentProcedure>
export type StartAttendeePaymentOutput = inferProcedureOutput<typeof startAttendeePaymentProcedure>
const startAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: { attendeeId }, ctx }) => {
    let deadline = addHours(getCurrentUTC(), 24)

    // DELETE THIS START
    // turn deadline back to const after this is removed
    const julebordAttendanceId = "b470eda0-4650-4dbd-bb6e-7bcf9c7757f9"
    const arbitraryJulebordDeadline = new TZDate("2025-11-07T19:00:00Z") // this is 20:00 local time in norway
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, attendeeId)
    if (attendee.attendanceId === julebordAttendanceId) {
      deadline = max([arbitraryJulebordDeadline, deadline])
    }
    // DELETE THIS END

    return ctx.attendanceService.startAttendeePayment(ctx.handle, attendeeId, deadline)
  })

export type DeregisterForEventInput = inferProcedureInput<typeof deregisterForEventProcedure>
export type DeregisterForEventOutput = inferProcedureOutput<typeof deregisterForEventProcedure>
const deregisterForEventProcedure = procedure
  .input(
    z.object({
      attendanceId: AttendancePoolSchema.shape.id,
      deregisterReason: z.object({
        type: DeregisterReasonTypeSchema,
        details: z.string().nullable(),
      }),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.attendanceId)
    const attendee = attendance.attendees.find((attendee) => attendee.user.id === ctx.principal.subject)
    if (attendee === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    await ctx.attendanceService.deregisterAttendee(ctx.handle, attendee.id, {
      ignoreDeregistrationWindow: false,
    })

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    await ctx.eventService.createDeregisterReason(ctx.handle, {
      ...input.deregisterReason,
      userId: ctx.principal.subject,
      eventId: event.id,
      registeredAt: attendee.createdAt,
      userGrade: attendee.userGrade,
    })
  })

export type AdminDeregisterForEventInput = inferProcedureInput<typeof adminDeregisterForEventProcedure>
export type AdminDeregisterForEventOutput = inferProcedureOutput<typeof adminDeregisterForEventProcedure>
const adminDeregisterForEventProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(ctx.handle, input.attendeeId)
    const attendee = attendance.attendees.find((attendee) => attendee.id === input.attendeeId)
    if (attendee === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return await ctx.attendanceService.deregisterAttendee(ctx.handle, attendee.id, {
      ignoreDeregistrationWindow: true,
    })
  })

export type AdminUpdateAtteendeeReservedInput = inferProcedureInput<typeof adminUpdateAtteendeeReservedProcedure>
export type AdminUpdateAtteendeeReservedOutput = inferProcedureOutput<typeof adminUpdateAtteendeeReservedProcedure>
const adminUpdateAtteendeeReservedProcedure = procedure
  .input(
    z.object({
      attendeeId: AttendeeSchema.shape.id,
      reserved: AttendeeSchema.shape.reserved,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.attendanceService.updateAttendeeById(ctx.handle, input.attendeeId, { reserved: input.reserved })
  })

export type RegisterAttendanceInput = inferProcedureInput<typeof registerAttendanceProcedure>
export type RegisterAttendanceOutput = inferProcedureOutput<typeof registerAttendanceProcedure>
const registerAttendanceProcedure = procedure
  .input(
    z.object({
      id: AttendeeSchema.shape.id,
      at: z.coerce.date().nullable(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.attendanceService.registerAttendance(ctx.handle, input.id, input.at ? new TZDate(input.at) : null)
  })

export type UpdateSelectionResponsesInput = inferProcedureInput<typeof updateSelectionResponsesProcedure>
export type UpdateSelectionResponsesOutput = inferProcedureOutput<typeof updateSelectionResponsesProcedure>
const updateSelectionResponsesProcedure = procedure
  .input(
    z.object({
      attendeeId: AttendeeSchema.shape.id,
      options: AttendeeSelectionResponseSchema.array(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.attendanceService.updateAttendeeById(ctx.handle, input.attendeeId, { selections: input.options })
  })

export type GetAttendanceInput = inferProcedureInput<typeof getAttendanceProcedure>
export type GetAttendanceOutput = inferProcedureOutput<typeof getAttendanceProcedure>
const getAttendanceProcedure = procedure
  .input(z.object({ id: AttendanceSchema.shape.id }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.attendanceService.getAttendanceById(ctx.handle, input.id))

export type UpdateAttendanceInput = inferProcedureInput<typeof updateAttendanceProcedure>
export type UpdateAttendanceOutput = inferProcedureOutput<typeof updateAttendanceProcedure>
const updateAttendanceProcedure = procedure
  .input(
    z.object({
      id: AttendanceSchema.shape.id,
      attendance: AttendanceWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) =>
    ctx.attendanceService.updateAttendanceById(ctx.handle, input.id, input.attendance)
  )

export type FindChargeAttendeeScheduleDateInput = inferProcedureInput<typeof findChargeAttendeeScheduleDateProcedure>
export type FindChargeAttendeeScheduleDateOutput = inferProcedureOutput<typeof findChargeAttendeeScheduleDateProcedure>
const findChargeAttendeeScheduleDateProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .output(z.date().nullable())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    // Allow users to find their own charge date
    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isSameSubject(() => attendee.userId)
      ),
      input
    )

    return await ctx.attendanceService.findChargeAttendeeScheduleDate(ctx.handle, attendee.id)
  })

export const attendanceRouter = t.router({
  createPool: createPoolProcedure,
  updatePool: updatePoolProcedure,
  deletePool: deletePoolProcedure,
  adminRegisterForEvent: adminRegisterForEventProcedure,
  updateAttendancePayment: updateAttendancePaymentProcedure,
  getSelectionsResults: getSelectionsResultsProcedure,
  getRegistrationAvailability: getRegistrationAvailabilityProcedure,
  registerForEvent: registerForEventProcedure,
  onRegisterChange: onRegisterChangeProcedure,
  cancelAttendeePayment: cancelAttendeePaymentProcedure,
  startAttendeePayment: startAttendeePaymentProcedure,
  deregisterForEvent: deregisterForEventProcedure,
  adminDeregisterForEvent: adminDeregisterForEventProcedure,
  adminUpdateAtteendeeReserved: adminUpdateAtteendeeReservedProcedure,
  registerAttendance: registerAttendanceProcedure,
  updateSelectionResponses: updateSelectionResponsesProcedure,
  getAttendance: getAttendanceProcedure,
  updateAttendance: updateAttendanceProcedure,
  findChargeAttendeeScheduleDate: findChargeAttendeeScheduleDateProcedure,
})
