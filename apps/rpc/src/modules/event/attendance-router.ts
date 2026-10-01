import { TZDate } from "@date-fns/tz"
import { getCurrentUTC } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { TRPCError } from "@trpc/server"
import { addHours, addMilliseconds, isPast } from "date-fns"
import { on } from "node:events"
import { z } from "zod"
import { isAdministrator, isCommitteeMember, isGroupMemberOfAny, isSameSubject, or } from "../../authorization"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError, UnauthorizedError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, procedureTraceErrorsOnly, t } from "../../trpc"
import type { GroupId } from "../group/group"
import { UserSchema } from "../user/user"
import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  AttendeeSelectionResponseSchema,
  areAttendeeSelectionsEqual,
  DEREGISTER_GRACE_PERIOD_MS,
  isPastDeregisterDeadlineForAttendee,
  RegistrationAvailabilityViewSchema,
  RegisterChangeEventSchema,
} from "./attendance"
import {
  buildDeregistrationAvailabilityView,
  buildRegistrationAvailabilityView,
  getRegistrationAvailabilityFailureCause,
} from "./attendance-service"
import { DeregisterReasonTypeSchema, EventSchema } from "./event"

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdPool = await ctx.attendanceService.createAttendancePool(ctx.handle, input.id, input.input)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.id)

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
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByPoolId(ctx.handle, input.id)
    const pool = attendance.pools.find((pool) => pool.id === input.id)
    if (pool === undefined) {
      throw new NotFoundError(`AttendancePool(ID=${input.id}) not found`)
    }

    const updatedPool = await ctx.attendanceService.updateAttendancePool(ctx.handle, input.id, {
      ...pool,
      ...input.input,
    })

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByPoolId(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)

    const pool = attendance.pools.find((pool) => pool.id === input.id)
    if (pool === undefined) {
      throw new NotFoundError(`AttendancePool(ID=${input.id}) not found`)
    }

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, input.id)

    if (event.hostingGroups.length > 0) {
      const organizerGroups = ctx.authorizationService.intersectGroupAffiliations(
        ctx.principal.affiliations,
        event.hostingGroups.map((group) => group.slug)
      )

      if (organizerGroups.size === 0) {
        throw new UnauthorizedError(
          `User(ID=${ctx.principal.subject}) is not authorized to delete Attendance(ID=${input.id}) for Event(ID=${event.id},Title=${event.title})`
        )
      }
    }

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
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

    const attendee = await ctx.attendanceService.registerAttendee(ctx.handle, result)

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceById(ctx.handle, input.id)

    await ctx.attendanceService.updateAttendancePaymentPrice(ctx.handle, input.id, input.price)

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
    ctx.setAuditTransactionName(
      `Update AttendancePayment(AttendanceID=${attendance.id}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type GetSelectionsResultsInput = inferProcedureInput<typeof getSelectionsResultsProcedure>
export type GetSelectionsResultsOutput = inferProcedureOutput<typeof getSelectionsResultsProcedure>
const getSelectionsResultsProcedure = procedure
  .input(z.object({ attendanceId: AttendanceSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
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

      yield registerChangeEvent
    }
  })

export type CancelAttendeePaymentInput = inferProcedureInput<typeof cancelAttendeePaymentProcedure>
export type CancelAttendeePaymentOutput = inferProcedureOutput<typeof cancelAttendeePaymentProcedure>
const cancelAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: { attendeeId }, ctx }) => {
    await ctx.attendanceService.cancelAttendeePayment(ctx.handle, attendeeId, ctx.principal.subject)

    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)
    ctx.setAuditTransactionName(
      `Cancel Payment for Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type StartAttendeePaymentInput = inferProcedureInput<typeof startAttendeePaymentProcedure>
export type StartAttendeePaymentOutput = inferProcedureOutput<typeof startAttendeePaymentProcedure>
const startAttendeePaymentProcedure = procedure
  .input(z.object({ attendeeId: AttendeeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: { attendeeId }, ctx }) => {
    const deadline = addHours(getCurrentUTC(), 24)

    const payment = await ctx.attendanceService.startAttendeePayment(ctx.handle, attendeeId, deadline)

    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, attendeeId)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)
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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(ctx.handle, input.attendeeId)
    const attendee = attendance.attendees.find((attendee) => attendee.id === input.attendeeId)
    if (attendee === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }

    await ctx.attendanceService.deregisterAttendee(ctx.handle, attendee.id, {
      ignoreDeregistrationWindow: true,
    })

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendance.id)
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
      registered: AttendeeSchema.shape.registered,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.updateAttendeeById(ctx.handle, input.attendeeId, {
      registered: input.registered,
    })

    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.attendanceService.registerAttendance(ctx.handle, input.id, input.at ? new TZDate(input.at) : null)

    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.id)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, attendee.attendanceId)

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

    const hostingGroupIds = event.hostingGroups.map((g) => g.slug) as [GroupId, ...GroupId[]]

    await ctx.addAuthorizationGuard(
      or(
        isGroupMemberOfAny(hostingGroupIds),
        isSameSubject(() => attendee.userId)
      ),
      input
    )

    const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(ctx.handle, input.attendeeId)

    if (
      !areAttendeeSelectionsEqual(input.options, attendee.selections) &&
      isPastDeregisterDeadlineForAttendee(attendance, attendee)
    ) {
      throw new FailedPreconditionError(
        `Cannot update selections for Attendee(ID=${input.attendeeId}) after deregister deadline`
      )
    }

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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedAttendance = await ctx.attendanceService.updateAttendanceById(ctx.handle, input.id, input.attendance)
    const event = await ctx.eventService.getByAttendanceId(ctx.handle, updatedAttendance.id)
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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)
    const [firstGroupId, ...restGroupIds] = event.hostingGroups.map((g) => g.slug)
    await ctx.addAuthorizationGuard(
      firstGroupId !== undefined
        ? or(isAdministrator(), isGroupMemberOfAny([firstGroupId, ...restGroupIds]))
        : isAdministrator(),
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
  cancelAttendeePayment: cancelAttendeePaymentProcedure,
  startAttendeePayment: startAttendeePaymentProcedure,
  deregisterForEvent: deregisterForEventProcedure,
  adminDeregisterForEvent: adminDeregisterForEventProcedure,
  adminUpdateAttendeeRegistered: adminUpdateAttendeeRegisteredProcedure,
  registerAttendance: registerAttendanceProcedure,
  updateSelectionResponses: updateSelectionResponsesProcedure,
  getAttendance: getAttendanceProcedure,
  updateAttendance: updateAttendanceProcedure,
  findChargeAttendeeScheduleDate: findChargeAttendeeScheduleDateProcedure,
  notifyAttendees: notifyAttendeesProcedure,
})
