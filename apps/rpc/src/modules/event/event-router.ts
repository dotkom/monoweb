import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { ForbiddenError, InvalidArgumentError, NotFoundError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import {
  canAddEventAttendance,
  canCreateEvent,
  canDeleteEvent,
  canEditEvent,
  canGetEventForAdmin,
  canListDeregisterReasons,
  canListUnansweredFeedback,
  canUploadEventFiles,
  canViewEvent,
  canViewUnansweredFeedback,
  excludedVisibilitiesFor,
  isEventCommitteeOrganizer,
} from "../../permissions/event-permissions"
import { isCommitteeAffiliation } from "../../permissions/principal"
import { procedure, t } from "../../trpc"
import { CompanySchema } from "../company/company"
import { feedbackRouter } from "../feedback-form/feedback-router"
import { GroupSchema } from "../group/group"
import { UserSchema } from "../user/user"
import { AttendanceSchema, AttendanceSummarySchema, AttendanceWriteSchema } from "./attendance"
import { attendanceRouter } from "./attendance-router"
import {
  BaseEventSchema,
  buildEventWithAttendanceView,
  EventFilterQuerySchema,
  EventSchema,
  EventWithAttendanceSchema,
  EventWithAttendanceSummarySchema,
  EventWithAttendanceViewSchema,
  EventWithFeedbackFormSchema,
  EventWriteSchema,
} from "./event"

function assertHasCommitteeOrganizer(groupIds: Iterable<string>): void {
  const hasCommitteeOrganizer = [...groupIds].some((groupId) => isCommitteeAffiliation(groupId))

  if (!hasCommitteeOrganizer) {
    throw new InvalidArgumentError("Event must have at least one committee organizer")
  }
}

export type GetEventInput = inferProcedureInput<typeof getEventProcedure>
export type GetEventOutput = inferProcedureOutput<typeof getEventProcedure>
const getEventProcedure = procedure
  .input(EventSchema.shape.id)
  .output(EventWithAttendanceViewSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input)

    if (!canViewEvent(ctx.principal, event.visibility)) {
      throw new NotFoundError(`Event(ID=${input}) not found`)
    }

    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null

    return buildEventWithAttendanceView({ event, attendance }, ctx.principal?.subject ?? null)
  })

const getEventForAdminProcedure = procedure
  .input(EventSchema.shape.id)
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canGetEventForAdmin)))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input)
    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null

    return { event, attendance }
  })

const getEventForAdminByAttendanceIdProcedure = procedure
  .input(AttendanceSchema.shape.id)
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canGetEventForAdmin)))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx: context }) => {
    const event = await context.eventService.getByAttendanceId(context.handle, input)
    const attendance = await context.attendanceService.findAttendanceById(context.handle, input)

    return { event, attendance }
  })

export type FindEventInput = inferProcedureInput<typeof findEventProcedure>
export type FindEventOutput = inferProcedureOutput<typeof findEventProcedure>
const findEventProcedure = procedure
  .input(EventSchema.shape.id)
  .output(EventWithAttendanceViewSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.findEventById(ctx.handle, input)
    if (!event) {
      return null
    }

    if (!canViewEvent(ctx.principal, event.visibility)) {
      return null
    }

    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null

    return buildEventWithAttendanceView({ event, attendance }, ctx.principal?.subject ?? null)
  })

export type CreateEventInput = inferProcedureInput<typeof createEventProcedure>
export type CreateEventOutput = inferProcedureOutput<typeof createEventProcedure>
const createEventProcedure = procedure
  .input(
    z.object({
      event: EventWriteSchema,
      groupIds: z.array(GroupSchema.shape.slug),
      companyIds: z.array(CompanySchema.shape.id),
      parentId: EventSchema.shape.parentId.optional(),
    })
  )
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canCreateEvent(principal, input.groupIds))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    assertHasCommitteeOrganizer(input.groupIds)

    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.groupIds)

    if (groups.some((group) => group.type === "EMAIL_ONLY")) {
      throw new InvalidArgumentError("Email-only groups cannot be used as organizers for events")
    }

    const eventWithoutOrganizers = await ctx.eventService.createEvent(ctx.handle, input.event)
    const event = await ctx.eventService.updateEventOrganizers(
      ctx.handle,
      eventWithoutOrganizers.id,
      new Set(input.groupIds),
      new Set(input.companyIds)
    )
    await ctx.eventService.updateEventParent(ctx.handle, event.id, input.parentId ?? null)

    ctx.setAuditTransactionName(`Create Event(ID=${event.id},Title=${event.title})`)

    return { event, attendance: null }
  })

export type EditEventInput = inferProcedureInput<typeof editEventProcedure>
export type EditEventOutput = inferProcedureOutput<typeof editEventProcedure>
const editEventProcedure = procedure
  .input(
    z.object({
      id: EventSchema.shape.id,
      event: EventWriteSchema,
      groupIds: z.array(GroupSchema.shape.slug),
      companyIds: z.array(CompanySchema.shape.id),
      parentId: EventSchema.shape.parentId.optional(),
    })
  )
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.id)
    const hostingGroupIds = event.hostingGroups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canEditEvent(principal, hostingGroupIds, input.groupIds)),
      input
    )

    assertHasCommitteeOrganizer(input.groupIds)

    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.groupIds)

    if (groups.some((group) => group.type === "EMAIL_ONLY")) {
      throw new InvalidArgumentError("Email-only groups cannot be used as organizers for events")
    }

    const updatedEventWithoutOrganizers = await ctx.eventService.updateEvent(ctx.handle, input.id, input.event)
    const updatedEvent = await ctx.eventService.updateEventOrganizers(
      ctx.handle,
      updatedEventWithoutOrganizers.id,
      new Set(input.groupIds),
      new Set(input.companyIds)
    )
    await ctx.eventService.updateEventParent(ctx.handle, updatedEvent.id, input.parentId ?? null)

    const attendance = updatedEventWithoutOrganizers.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, updatedEventWithoutOrganizers.attendanceId)
      : null

    ctx.setAuditTransactionName(`Update Event(ID=${updatedEvent.id},Title=${updatedEvent.title})`)

    return { event: updatedEvent, attendance }
  })

export type DeleteEventInput = inferProcedureInput<typeof deleteEventProcedure>
export type DeleteEventOutput = inferProcedureOutput<typeof deleteEventProcedure>
const deleteEventProcedure = procedure
  .input(z.object({ id: EventSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.findEventById(ctx.handle, input.id)
    const hostingGroupIds = event?.hostingGroups.map((group) => group.slug) ?? []

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canDeleteEvent(principal, hostingGroupIds)),
      input
    )

    const deletedEvent = await ctx.eventService.deleteEvent(ctx.handle, input.id)
    ctx.setAuditTransactionName(`Delete Event(ID=${deletedEvent.id},Title=${deletedEvent.title})`)

    return deletedEvent
  })

export type AllEventsInput = inferProcedureInput<typeof allEventsProcedure>
export type AllEventsOutput = inferProcedureOutput<typeof allEventsProcedure>
const allEventsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).prefault({}))
  .output(
    z.object({
      items: EventWithAttendanceViewSchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, filter?.excludingVisibility ?? [])

    const events = await ctx.eventService.findEvents(ctx.handle, { ...filter, excludingVisibility }, page)
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null)
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) || null,
    }))

    const items = eventsWithAttendance.map((eventWithAttendance) =>
      buildEventWithAttendanceView(eventWithAttendance, ctx.principal?.subject ?? null)
    )

    return {
      items,
      nextCursor: events.at(-1)?.id,
    }
  })

export type AllEventSummariesInput = inferProcedureInput<typeof allEventSummariesProcedure>
export type AllEventSummariesOutput = inferProcedureOutput<typeof allEventSummariesProcedure>
const allEventSummariesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).prefault({}))
  .output(
    z.object({
      items: EventWithAttendanceSummarySchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, filter?.excludingVisibility ?? [])

    const events = await ctx.eventService.findEventSummaries(ctx.handle, { ...filter, excludingVisibility }, page)
    const attendances = await ctx.attendanceService.getAttendanceSummariesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null),
      ctx.principal?.subject
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) || null,
    }))

    return {
      items: eventsWithAttendance,
      nextCursor: events.at(-1)?.id,
    }
  })

export type AllByAttendingUserIdInput = inferProcedureInput<typeof allByAttendingUserIdProcedure>
export type AllByAttendingUserIdOutput = inferProcedureOutput<typeof allByAttendingUserIdProcedure>
const allByAttendingUserIdProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      filter: EventFilterQuerySchema.optional(),
      id: UserSchema.shape.id,
    })
  )
  .output(
    z.object({
      items: EventWithAttendanceViewSchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { id, filter, ...page } = input

    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, filter?.excludingVisibility ?? [])

    const events = await ctx.eventService.findEventsByAttendingUserId(
      ctx.handle,
      id,
      { ...filter, excludingVisibility },
      page
    )
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null)
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
    }))

    return {
      items: eventsWithAttendance.map((eventWithAttendance) =>
        buildEventWithAttendanceView(eventWithAttendance, ctx.principal.subject)
      ),
      nextCursor: events.at(-1)?.id,
    }
  })

const allByAttendingUserIdForCalendarProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      id: UserSchema.shape.id,
    })
  )
  .output(
    z.object({
      items: EventWithAttendanceViewSchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const expectedServiceSubject = `${ctx.configuration.AUTH0_WEB_CLIENT_ID}@clients`

    if (ctx.principal.subject !== expectedServiceSubject || !ctx.principal.scopes.has("read:calendar_feed")) {
      throw new ForbiddenError("Only the web calendar service can access personal calendar feeds")
    }

    const { id, ...page } = input

    const userAffiliations = await ctx.authorizationService.getGroupAffiliations(ctx.handle, id)
    const excludingVisibility = excludedVisibilitiesFor({ affiliations: userAffiliations }, [])

    const events = await ctx.eventService.findEventsByAttendingUserId(ctx.handle, id, { excludingVisibility }, page)
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((attendanceId) => attendanceId !== null)
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
    }))

    const items = eventsWithAttendance.map((eventWithAttendance) =>
      buildEventWithAttendanceView(eventWithAttendance, input.id)
    )

    return {
      items,
      nextCursor: events.at(-1)?.id,
    }
  })

export type AllSummariesByAttendingUserIdInput = inferProcedureInput<typeof allSummariesByAttendingUserIdProcedure>
export type AllSummariesByAttendingUserIdOutput = inferProcedureOutput<typeof allSummariesByAttendingUserIdProcedure>
const allSummariesByAttendingUserIdProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      filter: EventFilterQuerySchema.optional(),
      id: UserSchema.shape.id,
      registeredOnly: z.boolean().optional(),
    })
  )
  .output(
    z.object({
      items: EventWithAttendanceSummarySchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { id, filter, registeredOnly, ...page } = input
    const isViewingOwnEvents = ctx.principal.subject === id

    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, filter?.excludingVisibility ?? [], {
      canViewCommitteeOnly: isViewingOwnEvents,
    })

    const events = await ctx.eventService.findEventSummariesByAttendingUserId(
      ctx.handle,
      id,
      { ...filter, excludingVisibility },
      page,
      registeredOnly
    )
    const attendances = await ctx.attendanceService.getAttendanceSummariesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((attendanceId) => attendanceId !== null),
      ctx.principal?.subject
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
    }))

    return {
      items: eventsWithAttendance,
      nextCursor: events.at(-1)?.id,
    }
  })

export type AddAttendanceInput = inferProcedureInput<typeof addAttendanceProcedure>
export type AddAttendanceOutput = inferProcedureOutput<typeof addAttendanceProcedure>
const addAttendanceProcedure = procedure
  .input(z.object({ values: AttendanceWriteSchema, eventId: EventSchema.shape.id }))
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) =>
        canAddEventAttendance(
          principal,
          event.hostingGroups.map((group) => group.slug)
        )
      ),
      input
    )

    const attendance = await ctx.attendanceService.createAttendance(ctx.handle, input.values)
    const updatedEvent = await ctx.eventService.updateEventAttendance(ctx.handle, input.eventId, attendance.id)

    ctx.setAuditTransactionName(
      `Add Attendance(ID=${attendance.id}) to Event(ID=${input.eventId},Title=${event.title})`
    )

    return { event: updatedEvent, attendance }
  })

export type FindParentEventInput = inferProcedureInput<typeof findParentEventProcedure>
export type FindParentEventOutput = inferProcedureOutput<typeof findParentEventProcedure>
const findParentEventProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id }))
  .output(EventWithAttendanceViewSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const childEvent = await ctx.eventService.findEventById(ctx.handle, input.eventId)
    if (!childEvent?.parentId) {
      return null
    }

    if (!canViewEvent(ctx.principal, childEvent.visibility)) {
      return null
    }

    const event = await ctx.eventService.findEventById(ctx.handle, childEvent.parentId)
    if (!event) {
      return null
    }

    if (!canViewEvent(ctx.principal, event.visibility)) {
      return null
    }

    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null

    return buildEventWithAttendanceView({ event, attendance }, ctx.principal?.subject ?? null)
  })

export type FindChildEventsInput = inferProcedureInput<typeof findChildEventsProcedure>
export type FindChildEventsOutput = inferProcedureOutput<typeof findChildEventsProcedure>
const findChildEventsProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id }))
  .output(EventWithAttendanceViewSchema.array())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const parentEvent = await ctx.eventService.findEventById(ctx.handle, input.eventId)
    if (parentEvent === null || !canViewEvent(ctx.principal, parentEvent.visibility)) {
      return []
    }

    const childEvents = await ctx.eventService.findByParentEventId(ctx.handle, input.eventId, { orderBy: "asc" })
    const events = childEvents.filter((event) => canViewEvent(ctx.principal, event.visibility))
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null)
    )
    return events.map((event) =>
      buildEventWithAttendanceView(
        {
          event,
          attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
        },
        ctx.principal?.subject ?? null
      )
    )
  })

export type FindUnansweredByUserInput = inferProcedureInput<typeof findUnansweredByUserProcedure>
export type FindUnansweredByUserOutput = inferProcedureOutput<typeof findUnansweredByUserProcedure>
const findUnansweredByUserProcedure = procedure
  .input(UserSchema.shape.id)
  .output(EventWithFeedbackFormSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canListUnansweredFeedback(principal, input))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const allEvents = await ctx.eventService.findEventsWithUnansweredFeedbackFormByUserId(ctx.handle, input)

    return allEvents.filter((event) =>
      canViewUnansweredFeedback(
        ctx.principal,
        input,
        event.hostingGroups.map((group) => group.slug)
      )
    )
  })

export type IsOrganizerInput = inferProcedureInput<typeof isOrganizerProcedure>
export type IsOrganizerOutput = inferProcedureOutput<typeof isOrganizerProcedure>
const isOrganizerProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id }))
  .output(z.boolean())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)

    return isEventCommitteeOrganizer(
      ctx.principal,
      event.hostingGroups.map((group) => group.slug)
    )
  })

export type FindManyDeregisterReasonsWithEventInput = inferProcedureInput<
  typeof findManyDeregisterReasonsWithEventProcedure
>
export type FindManyDeregisterReasonsWithEventOutput = inferProcedureOutput<
  typeof findManyDeregisterReasonsWithEventProcedure
>
const findManyDeregisterReasonsWithEventProcedure = procedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canListDeregisterReasons)))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const rows = await ctx.eventService.findManyDeregisterReasonsWithEvent(ctx.handle, input)

    return {
      items: rows,
      nextCursor: rows.at(-1)?.id,
    }
  })

export type FindFeaturedEventsInput = inferProcedureInput<typeof findFeaturedEventsProcedure>
export type FindFeaturedEventsOutput = inferProcedureOutput<typeof findFeaturedEventsProcedure>
const findFeaturedEventsProcedure = procedure
  .input(
    z
      .object({
        offset: z.int().min(0).default(0),
        cursor: z.int().min(0).optional(),
        limit: z.int().min(1).max(100).default(10),
        filter: EventFilterQuerySchema.optional(),
        excludeAttendedByUser: z.boolean().default(false),
      })
      .default({ offset: 0, limit: 1, excludeAttendedByUser: false })
  )
  .output(
    z
      .object({
        event: BaseEventSchema,
        attendance: AttendanceSummarySchema.nullable(),
      })
      .array()
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const excludingVisibility = excludedVisibilitiesFor(ctx.principal, input.filter?.excludingVisibility ?? [])

    const events = await ctx.eventService.findFeaturedEvents(
      ctx.handle,
      {
        ...input.filter,
        excludingVisibility,
      },
      input.cursor ?? input.offset,
      input.limit,
      ctx.principal?.subject ?? null,
      input.excludeAttendedByUser
    )

    const attendances = await ctx.attendanceService.getAttendanceSummariesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null),
      ctx.principal?.subject
    )

    const eventsWithAttendance = events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
    }))

    return eventsWithAttendance
  })

export type CreateFileUploadInput = inferProcedureInput<typeof createFileUploadProcedure>
export type CreateFileUploadOutput = inferProcedureOutput<typeof createFileUploadProcedure>
const createFileUploadProcedure = procedure
  .input(z.object({ filename: z.string(), contentType: z.string() }))
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canUploadEventFiles)))
  .mutation(async ({ ctx, input }) => {
    return ctx.eventService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export const eventRouter = t.router({
  attendance: attendanceRouter,
  feedback: feedbackRouter,
  get: getEventProcedure,
  getForAdmin: getEventForAdminProcedure,
  getForAdminByAttendanceId: getEventForAdminByAttendanceIdProcedure,
  find: findEventProcedure,
  create: createEventProcedure,
  edit: editEventProcedure,
  delete: deleteEventProcedure,
  all: allEventsProcedure,
  allByAttendingUserId: allByAttendingUserIdProcedure,
  allByAttendingUserIdForCalendar: allByAttendingUserIdForCalendarProcedure,
  allSummaries: allEventSummariesProcedure,
  allSummariesByAttendingUserId: allSummariesByAttendingUserIdProcedure,
  addAttendance: addAttendanceProcedure,
  findParentEvent: findParentEventProcedure,
  findChildEvents: findChildEventsProcedure,
  findUnansweredByUser: findUnansweredByUserProcedure,
  isOrganizer: isOrganizerProcedure,
  findManyDeregisterReasonsWithEvent: findManyDeregisterReasonsWithEventProcedure,
  createFileUpload: createFileUploadProcedure,
  findFeaturedEvents: findFeaturedEventsProcedure,
})
