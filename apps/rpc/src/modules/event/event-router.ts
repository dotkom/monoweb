import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  AttendanceSummarySchema,
  AttendanceWriteSchema,
  BaseEventSchema,
  CompanySchema,
  EventFilterQuerySchema,
  EventSchema,
  EventWithAttendanceSchema,
  EventWithAttendanceSummarySchema,
  EventWithFeedbackFormSchema,
  EventWriteSchema,
  GroupSchema,
  UserSchema,
} from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isEditor, or, isSameSubject } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"
import { EditorRole } from "../authorization-service"
import { feedbackRouter } from "../feedback-form/feedback-router"
import { attendanceRouter } from "./attendance-router"
import { ForbiddenError, UnauthorizedError } from "../../error"

export type GetEventInput = inferProcedureInput<typeof getEventProcedure>
export type GetEventOutput = inferProcedureOutput<typeof getEventProcedure>
const getEventProcedure = procedure
  .input(EventSchema.shape.id)
  .output(EventWithAttendanceSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input)
    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null
    return { event, attendance }
  })

export type FindEventInput = inferProcedureInput<typeof findEventProcedure>
export type FindEventOutput = inferProcedureOutput<typeof findEventProcedure>
const findEventProcedure = procedure
  .input(EventSchema.shape.id)
  .output(EventWithAttendanceSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const event = await ctx.eventService.findEventById(ctx.handle, input)
    if (!event) return null
    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null
    return { event, attendance }
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    // This will remove any groups the user is not affiliated with, which restricts editors to only being able to create
    // events for their own groups. This does not account for the parent event's organizer groups.
    const organizerGroups = await ctx.authorizationService.intersectGroupAffiliations(
      ctx.handle,
      ctx.principal.subject,
      input.groupIds
    )

    // If there are no organizer groups left, throw a ForbiddenError
    if (organizerGroups.size === 0 && input.groupIds.length > 0) {
      throw new ForbiddenError(
        `There are no allowed organizer groups to create the event for User(ID=${ctx.principal.subject}) with Input(GroupOrganizers=${input.groupIds.join(",")})`
      )
    }

    const eventWithoutOrganizers = await ctx.eventService.createEvent(ctx.handle, input.event)
    const event = await ctx.eventService.updateEventOrganizers(
      ctx.handle,
      eventWithoutOrganizers.id,
      organizerGroups,
      new Set(input.companyIds)
    )
    await ctx.eventService.updateEventParent(ctx.handle, event.id, input.parentId ?? null)
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    // This will remove any groups the user is not affiliated with, which restricts editors to only being able to create
    // events for their own groups. This does not account for the parent event's organizer groups.
    const organizerGroups = await ctx.authorizationService.intersectGroupAffiliations(
      ctx.handle,
      ctx.principal.subject,
      input.groupIds
    )

    // If there are no organizer groups left, throw a ForbiddenError
    if (organizerGroups.size === 0 && input.groupIds.length > 0) {
      throw new ForbiddenError(
        `There are no allowed organizer groups to create the event for User(ID=${ctx.principal.subject}) with Input(GroupOrganizers=${input.groupIds.join(",")})`
      )
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
    return { event: updatedEvent, attendance }
  })

export type DeleteEventInput = inferProcedureInput<typeof deleteEventProcedure>
export type DeleteEventOutput = inferProcedureOutput<typeof deleteEventProcedure>
const deleteEventProcedure = procedure
  .input(z.object({ id: EventSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.findEventById(ctx.handle, input.id)

    if (event?.hostingGroups.length) {
      const organizerGroups = await ctx.authorizationService.intersectGroupAffiliations(
        ctx.handle,
        ctx.principal.subject,
        event.hostingGroups.map((group) => group.slug)
      )

      if (!organizerGroups.size) {
        throw new UnauthorizedError(
          `User(ID=${ctx.principal.subject}) is not authorized to delete Event(ID=${input.id},Title=${event.title})`
        )
      }
    }

    return await ctx.eventService.deleteEvent(ctx.handle, input.id)
  })

export type AllEventsInput = inferProcedureInput<typeof allEventsProcedure>
export type AllEventsOutput = inferProcedureOutput<typeof allEventsProcedure>
const allEventsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).default({}))
  .output(
    z.object({
      items: EventWithAttendanceSchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    const principal = ctx.principal
    const isStaff = principal && Object.values(EditorRole).some((role) => principal.editorRoles.has(role))

    // If the user is not staff, we exclude internal events
    let excludingType = filter?.excludingType ?? []
    if (!isStaff && !excludingType.includes("INTERNAL")) {
      excludingType = [...excludingType, "INTERNAL"]
    }

    const events = await ctx.eventService.findEvents(ctx.handle, { ...filter, excludingType }, page)
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null)
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

export type AllEventSummariesInput = inferProcedureInput<typeof allEventSummariesProcedure>
export type AllEventSummariesOutput = inferProcedureOutput<typeof allEventSummariesProcedure>
const allEventSummariesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).default({}))
  .output(
    z.object({
      items: EventWithAttendanceSummarySchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    const principal = ctx.principal
    const isStaff = principal && Object.values(EditorRole).some((role) => principal.editorRoles.has(role))

    // If the user is not staff, we exclude internal events
    let excludingType = filter?.excludingType ?? []
    if (!isStaff && !excludingType.includes("INTERNAL")) {
      excludingType = [...excludingType, "INTERNAL"]
    }

    const events = await ctx.eventService.findEventSummaries(ctx.handle, { ...filter, excludingType }, page)
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
      items: EventWithAttendanceSchema.array(),
      nextCursor: EventSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { id, filter, ...page } = input

    const principal = ctx.principal
    const isStaff = principal && Object.values(EditorRole).some((role) => principal.editorRoles.has(role))

    // If the user is not staff, we exclude internal events
    let excludingType = filter?.excludingType ?? []
    if (!isStaff && !excludingType.includes("INTERNAL")) {
      excludingType = [...excludingType, "INTERNAL"]
    }

    const events = await ctx.eventService.findEventsByAttendingUserId(
      ctx.handle,
      id,
      { ...filter, excludingType },
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
      items: eventsWithAttendance,
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
    const { id, filter, ...page } = input

    const principal = ctx.principal
    const isStaff = principal && Object.values(EditorRole).some((role) => principal.editorRoles.has(role))

    // If the user is not staff, we exclude internal events
    let excludingType = filter?.excludingType ?? []
    if (!isStaff && !excludingType.includes("INTERNAL")) {
      excludingType = [...excludingType, "INTERNAL"]
    }

    const events = await ctx.eventService.findEventSummariesByAttendingUserId(
      ctx.handle,
      id,
      { ...filter, excludingType },
      page
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)

    if (event?.hostingGroups.length) {
      const organizerGroups = await ctx.authorizationService.intersectGroupAffiliations(
        ctx.handle,
        ctx.principal.subject,
        event.hostingGroups.map((group) => group.slug)
      )

      if (!organizerGroups.size) {
        throw new UnauthorizedError(
          `User(ID=${ctx.principal.subject}) is not authorized to add attendance to Event(ID=${input.eventId},Title=${event.title})`
        )
      }
    }

    const attendance = await ctx.attendanceService.createAttendance(ctx.handle, input.values)
    const updatedEvent = await ctx.eventService.updateEventAttendance(ctx.handle, input.eventId, attendance.id)
    return { event: updatedEvent, attendance }
  })

// TODO: rename this to `updateEventParent`
export type UpdateParentEventInput = inferProcedureInput<typeof updateParentEventProcedure>
export type UpdateParentEventOutput = inferProcedureOutput<typeof updateParentEventProcedure>
const updateParentEventProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id, parentEventId: EventSchema.shape.id.nullable() }))
  .output(EventWithAttendanceSchema)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const event = await ctx.eventService.findEventById(ctx.handle, input.eventId)

    if (event?.hostingGroups.length) {
      const organizerGroups = await ctx.authorizationService.intersectGroupAffiliations(
        ctx.handle,
        ctx.principal.subject,
        event.hostingGroups.map((group) => group.slug)
      )

      if (!organizerGroups.size) {
        throw new UnauthorizedError(
          `User(ID=${ctx.principal.subject}) is not authorized to delete Event(ID=${input.eventId},Title=${event.title})`
        )
      }
    }

    const updatedEvent = await ctx.eventService.updateEventParent(ctx.handle, input.eventId, input.parentEventId)
    const attendance = updatedEvent.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, updatedEvent.attendanceId)
      : null
    return { event: updatedEvent, attendance }
  })

export type FindParentEventInput = inferProcedureInput<typeof findParentEventProcedure>
export type FindParentEventOutput = inferProcedureOutput<typeof findParentEventProcedure>
const findParentEventProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id }))
  .output(EventWithAttendanceSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const childEvent = await ctx.eventService.findEventById(ctx.handle, input.eventId)
    if (!childEvent?.parentId) return null
    const event = await ctx.eventService.findEventById(ctx.handle, childEvent.parentId)
    if (!event) return null
    const attendance = event.attendanceId
      ? await ctx.attendanceService.findAttendanceById(ctx.handle, event.attendanceId)
      : null
    return { event, attendance }
  })

export type FindChildEventsInput = inferProcedureInput<typeof findChildEventsProcedure>
export type FindChildEventsOutput = inferProcedureOutput<typeof findChildEventsProcedure>
const findChildEventsProcedure = procedure
  .input(z.object({ eventId: EventSchema.shape.id }))
  .output(EventWithAttendanceSchema.array())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const events = await ctx.eventService.findByParentEventId(ctx.handle, input.eventId, { orderBy: "asc" })
    const attendances = await ctx.attendanceService.getAttendancesByIds(
      ctx.handle,
      events.map((item) => item.attendanceId).filter((id) => id !== null)
    )
    return events.map((event) => ({
      event,
      attendance: attendances.find((attendance) => attendance.id === event.attendanceId) ?? null,
    }))
  })

export type FindUnansweredByUserInput = inferProcedureInput<typeof findUnansweredByUserProcedure>
export type FindUnansweredByUserOutput = inferProcedureOutput<typeof findUnansweredByUserProcedure>
const findUnansweredByUserProcedure = procedure
  .input(UserSchema.shape.id)
  .output(EventWithFeedbackFormSchema.array())
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isEditor(),
        isSameSubject((input) => input)
      )
    )
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const allEvents = await ctx.eventService.findEventsWithUnansweredFeedbackFormByUserId(ctx.handle, input)

    // If the user is requesting their own unanswered events, return all without further checks
    if (ctx.principal.subject === input) {
      return allEvents
    }

    const authorizedEvents = []

    // AuthorizationService#intersectGroupAffiliations uses a cache, so a for loop is fine here over a Promise.all
    for (const event of allEvents) {
      const intersectedAffiliations = await ctx.authorizationService.intersectGroupAffiliations(
        ctx.handle,
        ctx.principal.subject,
        event.hostingGroups.map((group) => group.slug)
      )

      if (intersectedAffiliations.size > 0) {
        authorizedEvents.push(event)
      }
    }

    return authorizedEvents
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
    const intersectedAffiliations = await ctx.authorizationService.intersectGroupAffiliations(
      ctx.handle,
      ctx.principal.subject,
      event.hostingGroups.map((group) => group.slug)
    )

    return intersectedAffiliations.size > 0
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
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
        offset: z.number().min(0).default(0),
        limit: z.number().min(1).max(100).default(10),
      })
      .default({ offset: 0, limit: 1 })
  )
  .output(z.object({ event: BaseEventSchema, attendance: AttendanceSummarySchema.nullable() }).array())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const events = await ctx.eventService.findFeaturedEvents(ctx.handle, input.offset, input.limit)

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
  .use(withAuthorization(isEditor()))
  .mutation(async ({ ctx, input }) => {
    return ctx.eventService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export const eventRouter = t.router({
  attendance: attendanceRouter,
  feedback: feedbackRouter,
  get: getEventProcedure,
  find: findEventProcedure,
  create: createEventProcedure,
  edit: editEventProcedure,
  delete: deleteEventProcedure,
  all: allEventsProcedure,
  allByAttendingUserId: allByAttendingUserIdProcedure,
  allSummaries: allEventSummariesProcedure,
  allSummariesByAttendingUserId: allSummariesByAttendingUserIdProcedure,
  addAttendance: addAttendanceProcedure,
  updateParentEvent: updateParentEventProcedure,
  findParentEvent: findParentEventProcedure,
  findChildEvents: findChildEventsProcedure,
  findUnansweredByUser: findUnansweredByUserProcedure,
  isOrganizer: isOrganizerProcedure,
  findManyDeregisterReasonsWithEvent: findManyDeregisterReasonsWithEventProcedure,
  createFileUpload: createFileUploadProcedure,
  findFeaturedEvents: findFeaturedEventsProcedure,
})
