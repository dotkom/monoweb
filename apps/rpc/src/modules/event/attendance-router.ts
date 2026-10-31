import { TZDate } from "@date-fns/tz"
import { getCurrentUTC } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { TRPCError } from "@trpc/server"
import { addHours, addMilliseconds, isPast } from "date-fns"
import { on } from "node:events"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withDatabaseTransaction } from "../../middlewares"
import {
  canManageEventAttendance,
  canUpdateAttendeeSelections,
  canViewAttendeeChargeSchedule,
} from "../../permissions/attendance-permissions"
import { excludedVisibilitiesFor } from "../../permissions/event-permissions"
import { procedure, procedureTraceErrorsOnly, t, type TRPCContext } from "../../trpc"
import type { GroupId } from "../group/group"
import { UserSchema } from "../user/user"
import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceViewSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  AttendeeSelectionResponseSchema,
  buildAttendanceView,
  buildBulkRegisterChangeEvent,
  DEREGISTER_GRACE_PERIOD_MS,
  RegisterChangeEventSchema,
  RegistrationAvailabilityViewSchema,
  type RegisterChangeEvent,
} from "./attendance"
import {
  buildDeregistrationAvailabilityView,
  buildRegistrationAvailabilityView,
  getRegistrationAvailabilityFailureCause,
} from "./attendance-service"
import { DeregisterReasonTypeSchema, EventSchema } from "./event"

async function authorizeManageEventAttendance<TRuleInput>(
  ctx: { addAuthorizationGuard: TRPCContext["addAuthorizationGuard"] },
  hostingGroupIds: readonly GroupId[],
  input: TRuleInput
): Promise<void> {
  await ctx.addAuthorizationGuard(
    permitIf((principal) => canManageEventAttendance(principal, hostingGroupIds)),
    input
  )
}

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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const createdPool = await ctx.attendanceService.createAttendancePool(ctx.handle, input.id, input.input)

    ctx.setAuditTransactionName(
      `Create AttendancePool(ID=${createdPool.id},Title=${createdPool.title}) for Event(ID=${event.id},Title=${event.title})`
    )

    return createdPool
  })

export type UpdatePoolInput = inferProcedureInput<typeof updatePoolProcedure>
export type UpdatePoolOutput = inferProcedureOutput<typeof updatePoolProcedure>
const updatePoolProcedure = procedure
  .input(
    z.object({
      id: AttendancePoolSchema.shape.id,
      input: AttendancePoolWriteSchema.partial(),
      fillAddedSeats: z.boolean().default(false),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByPoolId(ctx.handle, input.id)
    const pool = attendance.pools.find((pool) => pool.id === input.id)
    if (pool === undefined) {
      throw new NotFoundError(`AttendancePool(ID=${input.id}) not found`)
    }

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const updatedPool = await ctx.attendanceService.updateAttendancePool(
      ctx.handle,
      input.id,
      {
        ...pool,
        ...input.input,
      },
      input.fillAddedSeats
    )

    ctx.setAuditTransactionName(
      `Update AttendancePool(ID=${updatedPool.id},Title=${updatedPool.title}) for Event(ID=${event.id},Title=${event.title})`
    )

    return updatedPool
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByPoolId(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    const pool = attendance.pools.find((pool) => pool.id === input.id)
    if (pool === undefined) {
      throw new NotFoundError(`AttendancePool(ID=${input.id}) not found`)
    }

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.deleteAttendancePool(ctx.handle, input.id)

    ctx.setAuditTransactionName(
      `Delete AttendancePool(ID=${input.id},Title=${pool.title}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type DeleteAttendanceInput = inferProcedureInput<typeof deleteAttendanceProcedure>
export type DeleteAttendanceOutput = inferProcedureOutput<typeof deleteAttendanceProcedure>
const deleteAttendanceProcedure = procedure
  .input(
    z.object({
      id: AttendanceSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.deleteAttendance(ctx.handle, input.id)

    ctx.setAuditTransactionName(`Delete Attendance(ID=${input.id}) for Event(ID=${event.id},Title=${event.title})`)
  })

const ADMIN_REGISTER_DEFAULT_OPTIONS = {
  ignoreRegisteredToParent: true,
  immediateReservation: false,
  immediatePayment: false,
  overrideTurnstileCheck: true,
} as const

export type AdminRegisterForEventInput = inferProcedureInput<typeof adminRegisterForEventProcedure>
export type AdminRegisterForEventOutput = inferProcedureOutput<typeof adminRegisterForEventProcedure>
const adminRegisterForEventProcedure = procedure
  .input(
    z.object({
      attendanceId: AttendanceSchema.shape.id,
      attendancePoolId: AttendancePoolSchema.shape.id,
      userId: UserSchema.shape.id,
      options: z
        .object({
          ignoreRegisteredToParent: z.boolean().default(ADMIN_REGISTER_DEFAULT_OPTIONS.ignoreRegisteredToParent),
          immediateReservation: z.boolean().default(ADMIN_REGISTER_DEFAULT_OPTIONS.immediateReservation),
          immediatePayment: z.boolean().default(ADMIN_REGISTER_DEFAULT_OPTIONS.immediatePayment),
          overrideTurnstileCheck: z.boolean().default(ADMIN_REGISTER_DEFAULT_OPTIONS.overrideTurnstileCheck),
        })
        .default(ADMIN_REGISTER_DEFAULT_OPTIONS),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const result = await ctx.attendanceService.getRegistrationAvailability(
      ctx.handle,
      input.attendanceId,
      null,
      input.userId,
      {
        ignoreRegistrationWindow: true,
        ignoreRegisteredToParent: input.options.ignoreRegisteredToParent,
        immediateReservation: input.options.immediateReservation,
        immediatePayment: input.options.immediatePayment,
        overriddenAttendancePoolId: input.attendancePoolId,
        overrideTurnstileCheck: input.options.overrideTurnstileCheck,
      }
    )

    if (!result.success) {
      throw new FailedPreconditionError(`Failed to register: ${getRegistrationAvailabilityFailureCause(result)}`)
    }

    const attendee = await ctx.attendanceService.registerAttendee(ctx.handle, result, ctx.principal.subject)

    ctx.setAuditTransactionName(
      `Admin register Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${result.event.id},Title=${result.event.title})`
    )

    return attendee
  })

export type UpdateAttendancePaymentInput = inferProcedureInput<typeof updateAttendancePaymentProcedure>
export type UpdateAttendancePaymentOutput = inferProcedureOutput<typeof updateAttendancePaymentProcedure>
const updateAttendancePaymentProcedure = procedure
  .input(
    z.object({
      id: AttendanceSchema.shape.id,
      price: z.int().nullable(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.updateAttendancePaymentPrice(ctx.handle, input.id, input.price)

    ctx.setAuditTransactionName(
      `Update AttendancePayment(AttendanceID=${attendance.id}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type GetSelectionsResultsInput = inferProcedureInput<typeof getSelectionsResultsProcedure>
export type GetSelectionsResultsOutput = inferProcedureOutput<typeof getSelectionsResultsProcedure>
const getSelectionsResultsProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.attendanceId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

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
  .input(
    z.object({
      attendanceId: AttendanceSchema.shape.id,
    })
  )
  .output(RegistrationAvailabilityViewSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const userId = ctx.principal.subject
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.attendanceId)
    const attendee = attendance.attendees.find((attendee) => attendee.userId === userId)

    if (attendee !== undefined) {
      const chargeScheduleDate = await ctx.attendanceService.findChargeAttendeeScheduleDate(ctx.handle, attendee.id)

      return RegistrationAvailabilityViewSchema.parse(
        buildDeregistrationAvailabilityView(userId, attendee, attendance, chargeScheduleDate)
      )
    }

    const [punishment, result] = await Promise.all([
      ctx.personalMarkService.findPunishmentByUserId(ctx.handle, userId),
      ctx.attendanceService.getRegistrationAvailability(ctx.handle, input.attendanceId, null, userId, {
        ignoreRegistrationWindow: false,
        immediateReservation: false,
        immediatePayment: true,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: true,
      }),
    ])

    return RegistrationAvailabilityViewSchema.parse(
      buildRegistrationAvailabilityView(userId, result, punishment, attendance)
    )
  })

export type RegisterForEventInput = inferProcedureInput<typeof registerForEventProcedure>
export type RegisterForEventOutput = inferProcedureOutput<typeof registerForEventProcedure>
const registerForEventProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id, turnstileToken: z.string() }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const result = await ctx.attendanceService.getRegistrationAvailability(
      ctx.handle,
      input.attendanceId,
      input.turnstileToken,
      ctx.principal.subject,
      {
        ignoreRegistrationWindow: false,
        immediateReservation: false,
        immediatePayment: true,
        overriddenAttendancePoolId: null,
        ignoreRegisteredToParent: false,
        overrideTurnstileCheck: false,
      }
    )

    if (!result.success) {
      throw new FailedPreconditionError(`Failed to register: ${getRegistrationAvailabilityFailureCause(result)}`)
    }

    const attendee = await ctx.attendanceService.registerAttendee(ctx.handle, result)

    ctx.setAuditTransactionName(
      `Register Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${result.event.id},Title=${result.event.title})`
    )

    return attendee
  })

export type OnRegisterChangeInput = inferProcedureInput<typeof onRegisterChangeProcedure>
export type OnRegisterChangeOutput = inferProcedureOutput<typeof onRegisterChangeProcedure>
const onRegisterChangeProcedure = procedureTraceErrorsOnly
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withDatabaseTransaction())
  .subscription(async function* ({ input, ctx, signal }) {
    for await (const [data] of on(ctx.eventEmitter, "attendance:register-change", { signal })) {
      const registerChangeEvent = RegisterChangeEventSchema.parse(data)

      if (registerChangeEvent.attendee.attendanceId !== input.attendanceId) {
        continue
      }

      yield buildBulkRegisterChangeEvent(registerChangeEvent, ctx.principal?.subject ?? null)
    }
  })

export type OnBulkRegisterChangeInput = inferProcedureInput<typeof onBulkRegisterChangeProcedure>
export type OnBulkRegisterChangeOutput = inferProcedureOutput<typeof onBulkRegisterChangeProcedure>
const onBulkRegisterChangeProcedure = procedureTraceErrorsOnly
  .input(z.object({ eventIds: EventSchema.shape.id.array().min(1) }))
  .subscription(async function* ({ input, ctx, signal }) {
    const eventIds = [...new Set(input.eventIds)]
    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, [])

    // Start listening before checking visibility so changes during the lookup are buffered.
    const registerChanges = on(ctx.eventEmitter, "attendance:register-change", { signal })

    try {
      const events = await ctx.eventService.findEventSummaries(
        ctx.prisma,
        {
          byId: eventIds,
          excludingVisibility,
        },
        {
          take: eventIds.length,
        }
      )

      const attendanceIds = new Set(
        events.map((event) => event.attendanceId).filter((id): id is NonNullable<typeof id> => id !== null)
      )

      for await (const [data] of registerChanges) {
        const registerChangeEvent = data as RegisterChangeEvent

        if (!attendanceIds.has(registerChangeEvent.attendee.attendanceId)) {
          continue
        }

        yield buildBulkRegisterChangeEvent(registerChangeEvent, ctx.principal?.subject ?? null)
      }
    } finally {
      await registerChanges.return?.()
    }
  })

export type CancelAttendeePaymentInput = inferProcedureInput<typeof cancelAttendeePaymentProcedure>
export type CancelAttendeePaymentOutput = inferProcedureOutput<typeof cancelAttendeePaymentProcedure>
const cancelAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.cancelAttendeePayment(ctx.handle, input.attendeeId, ctx.principal.subject)

    ctx.setAuditTransactionName(
      `Cancel Payment for Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type StartAttendeePaymentInput = inferProcedureInput<typeof startAttendeePaymentProcedure>
export type StartAttendeePaymentOutput = inferProcedureOutput<typeof startAttendeePaymentProcedure>
const startAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const deadline = addHours(getCurrentUTC(), 24)

    const payment = await ctx.attendanceService.startAttendeePayment(ctx.handle, input.attendeeId, deadline)

    ctx.setAuditTransactionName(
      `Start Payment for Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
    )

    return payment
  })

export type DeregisterForEventInput = inferProcedureInput<typeof deregisterForEventProcedure>
export type DeregisterForEventOutput = inferProcedureOutput<typeof deregisterForEventProcedure>
const deregisterForEventProcedure = procedure
  .input(
    z.object({
      attendanceId: AttendancePoolSchema.shape.id,
      deregisterReason: z
        .object({
          type: DeregisterReasonTypeSchema,
          details: z.string().nullable(),
        })
        .optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.attendanceId)
    const attendee = attendance.attendees.find((attendee) => attendee.user.id === ctx.principal.subject)

    if (attendee === undefined) {
      throw new NotFoundError(`Attendee(ID=${attendance.id},UserID=${ctx.principal.subject}) not found`)
    }

    const gracePeriodEnd = addMilliseconds(attendee.createdAt, DEREGISTER_GRACE_PERIOD_MS)

    if (input.deregisterReason === undefined && isPast(gracePeriodEnd)) {
      throw new InvalidArgumentError("Deregister reason is required outside the grace period")
    }

    await ctx.attendanceService.deregisterAttendee(ctx.handle, attendee.id, {
      ignoreDeregistrationWindow: false,
    })

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)

    if (input.deregisterReason) {
      await ctx.eventService.createDeregisterReason(ctx.handle, {
        ...input.deregisterReason,
        userId: ctx.principal.subject,
        eventId: event.id,
        registeredAt: attendee.createdAt,
        userGrade: attendee.userGrade,
      })
    }

    ctx.setAuditTransactionName(
      `Deregister Attendee(ID=${attendee.id},Name=${attendee.user.name}) from Event(ID=${event.id},Title=${event.title})`
    )
  })

export type AdminDeregisterForEventInput = inferProcedureInput<typeof adminDeregisterForEventProcedure>
export type AdminDeregisterForEventOutput = inferProcedureOutput<typeof adminDeregisterForEventProcedure>
const adminDeregisterForEventProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(ctx.handle, input.attendeeId)
    const attendee = attendance.attendees.find((attendee) => attendee.id === input.attendeeId)
    if (attendee === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.deregisterAttendee(ctx.handle, attendee.id, {
      ignoreDeregistrationWindow: true,
    })

    ctx.setAuditTransactionName(
      `Admin deregister Attendee(ID=${attendee.id},Name=${attendee.user.name}) from Event(ID=${event.id},Title=${event.title})`
    )
  })

export type AdminUpdateAttendeeRegisteredInput = inferProcedureInput<typeof adminUpdateAttendeeRegisteredProcedure>
export type AdminUpdateAttendeeRegisteredOutput = inferProcedureOutput<typeof adminUpdateAttendeeRegisteredProcedure>
const adminUpdateAttendeeRegisteredProcedure = procedure
  .input(
    z.object({
      attendeeId: AttendeeSchema.shape.id,
      registered: z.boolean(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const now = getCurrentUTC()
    const currentAttendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const attendeeBeforeUpdate = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendeeBeforeUpdate.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const attendee = await ctx.attendanceService.updateAttendeeById(ctx.handle, input.attendeeId, {
      registeredAt: input.registered ? (currentAttendee.registeredAt ?? now) : null,
    })

    ctx.setAuditTransactionName(
      `Admin update Attendee(ID=${attendee.id},Name=${attendee.user.name}) registered to ${input.registered} for Event(ID=${event.id},Title=${event.title})`
    )

    return attendee
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendeeBeforeUpdate = await ctx.attendanceService.getAttendeeById(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendeeBeforeUpdate.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    await ctx.attendanceService.registerAttendance(ctx.handle, input.id, input.at ? new TZDate(input.at) : null)

    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.id)

    const auditTransactionName =
      input.at !== null
        ? `Register Attendance of Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
        : `Clear Attendance of Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`

    ctx.setAuditTransactionName(auditTransactionName)
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
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)

    if (event.hostingGroups.length === 0) {
      throw new FailedPreconditionError(`Event(ID=${event.id}) does not have hosting groups`)
    }

    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canUpdateAttendeeSelections(principal, hostingGroupIds, attendee.userId)),
      input
    )

    const updatedAttendee = await ctx.attendanceService.updateAttendeeById(ctx.handle, input.attendeeId, {
      selections: input.options,
    })
    ctx.setAuditTransactionName(
      `Update Selection Responses for Attendee(ID=${updatedAttendee.id},Name=${updatedAttendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
    )

    return updatedAttendee
  })

export type GetAttendanceInput = inferProcedureInput<typeof getAttendanceProcedure>
export type GetAttendanceOutput = inferProcedureOutput<typeof getAttendanceProcedure>
const getAttendanceProcedure = procedure
  .input(z.object({ id: AttendanceSchema.shape.id }))
  .output(AttendanceViewSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.id)
    return buildAttendanceView(attendance, ctx.principal?.subject ?? null)
  })

const getAttendanceForAdminProcedure = procedure
  .input(z.object({ id: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageEventAttendance(principal, hostingGroupIds)),
      input
    )

    return attendance
  })

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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await authorizeManageEventAttendance(ctx, hostingGroupIds, input)

    const updatedAttendance = await ctx.attendanceService.updateAttendanceById(ctx.handle, input.id, input.attendance)
    ctx.setAuditTransactionName(
      `Update Attendance(ID=${updatedAttendance.id}) for Event(ID=${event.id},Title=${event.title})`
    )

    return updatedAttendance
  })

export type FindChargeAttendeeScheduleDateInput = inferProcedureInput<typeof findChargeAttendeeScheduleDateProcedure>
export type FindChargeAttendeeScheduleDateOutput = inferProcedureOutput<typeof findChargeAttendeeScheduleDateProcedure>
const findChargeAttendeeScheduleDateProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .output(z.date().nullable())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canViewAttendeeChargeSchedule(principal, hostingGroupIds, attendee.userId)),
      input
    )

    return await ctx.attendanceService.findChargeAttendeeScheduleDate(ctx.handle, attendee.id)
  })

export type NotifyAttendeesInput = inferProcedureInput<typeof notifyAttendeesProcedure>
export type NotifyAttendeesOutput = inferProcedureOutput<typeof notifyAttendeesProcedure>
const notifyAttendeesProcedure = procedure
  .input(
    z.object({
      eventId: EventSchema.shape.id,
      message: z.string(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageEventAttendance(principal, hostingGroupIds)),
      input
    )

    if (event.attendanceId === null) {
      throw new FailedPreconditionError("Event does not have attendance")
    }

    await ctx.attendanceService.notifyAttendees(ctx.handle, event.attendanceId, input.message)
  })

export const attendanceRouter = t.router({
  createPool: createPoolProcedure,
  updatePool: updatePoolProcedure,
  deletePool: deletePoolProcedure,
  deleteAttendance: deleteAttendanceProcedure,
  adminRegisterForEvent: adminRegisterForEventProcedure,
  updateAttendancePayment: updateAttendancePaymentProcedure,
  getSelectionsResults: getSelectionsResultsProcedure,
  getRegistrationAvailability: getRegistrationAvailabilityProcedure,
  registerForEvent: registerForEventProcedure,
  onRegisterChange: onRegisterChangeProcedure,
  onBulkRegisterChange: onBulkRegisterChangeProcedure,
  cancelAttendeePayment: cancelAttendeePaymentProcedure,
  startAttendeePayment: startAttendeePaymentProcedure,
  deregisterForEvent: deregisterForEventProcedure,
  adminDeregisterForEvent: adminDeregisterForEventProcedure,
  adminUpdateAttendeeRegistered: adminUpdateAttendeeRegisteredProcedure,
  registerAttendance: registerAttendanceProcedure,
  updateSelectionResponses: updateSelectionResponsesProcedure,
  getAttendance: getAttendanceProcedure,
  getAttendanceForAdmin: getAttendanceForAdminProcedure,
  updateAttendance: updateAttendanceProcedure,
  findChargeAttendeeScheduleDate: findChargeAttendeeScheduleDateProcedure,
  notifyAttendees: notifyAttendeesProcedure,
})
