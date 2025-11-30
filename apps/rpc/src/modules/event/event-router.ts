import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  AttendanceWriteSchema,
  CompanySchema,
  EventFilterQuerySchema,
  EventSchema,
  EventWithAttendanceSchema,
  EventWriteSchema,
  GroupSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { feedbackRouter } from "./feedback-router"

export const eventRouter = t.router({
  attendance: attendanceRouter,
  feedback: feedbackRouter,
  get: procedure
    .input(EventSchema.shape.id)
    .output(EventWithAttendanceSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.getEventById(handle, input)
        const attendance = event.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, event.attendanceId)
          : null
        return { event, attendance }
      })
    ),

  find: procedure
    .input(EventSchema.shape.id)
    .output(EventWithAttendanceSchema.nullable())
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.findEventById(handle, input)
        if (!event) {
          return null
        }
        const attendance = event.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, event.attendanceId)
          : null
        return { event, attendance }
      })
    ),

  create: staffProcedure
    .input(
      z.object({
        event: EventWriteSchema,
        groupIds: z.array(GroupSchema.shape.slug),
        companyIds: z.array(CompanySchema.shape.id),
        parentId: EventSchema.shape.parentId.optional(),
      })
    )
    .output(EventWithAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const eventWithoutOrganizers = await ctx.eventService.createEvent(handle, input.event)
        const event = await ctx.eventService.updateEventOrganizers(
          handle,
          eventWithoutOrganizers.id,
          new Set(input.groupIds),
          new Set(input.companyIds)
        )
        await ctx.eventService.updateEventParent(handle, event.id, input.parentId ?? null)
        return { event, attendance: null }
      })
    }),

  edit: staffProcedure
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
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const updatedEventWithoutOrganizers = await ctx.eventService.updateEvent(handle, input.id, input.event)
        const updatedEvent = await ctx.eventService.updateEventOrganizers(
          handle,
          updatedEventWithoutOrganizers.id,
          new Set(input.groupIds),
          new Set(input.companyIds)
        )
        await ctx.eventService.updateEventParent(handle, updatedEvent.id, input.parentId ?? null)

        const attendance = updatedEventWithoutOrganizers.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, updatedEventWithoutOrganizers.attendanceId)
          : null
        return { event: updatedEvent, attendance }
      })
    }),

  delete: staffProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        return await ctx.eventService.deleteEvent(handle, input.id)
      })
    }),

  all: procedure
    .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).default({}))
    .output(
      z.object({
        items: EventWithAttendanceSchema.array(),
        nextCursor: EventSchema.shape.id.optional(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const { filter, ...page } = input
        const events = await ctx.eventService.findEvents(handle, { ...filter }, page)
        const attendances = await ctx.attendanceService.getAttendancesByIds(
          handle,
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
    ),

  allByAttendingUserId: authenticatedProcedure
    .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional(), id: UserSchema.shape.id }))
    .output(
      z.object({
        items: EventWithAttendanceSchema.array(),
        nextCursor: EventSchema.shape.id.optional(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const { id, filter, ...page } = input
        const events = await ctx.eventService.findEventsByAttendingUserId(handle, id, { ...filter }, page)
        const attendances = await ctx.attendanceService.getAttendancesByIds(
          handle,
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
    ),

  addAttendance: staffProcedure
    .input(
      z.object({
        values: AttendanceWriteSchema,
        eventId: EventSchema.shape.id,
      })
    )
    .output(EventWithAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.createAttendance(handle, input.values)
        const event = await ctx.eventService.updateEventAttendance(handle, input.eventId, attendance.id)
        return { event, attendance }
      })
    }),

  updateParentEvent: staffProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
        parentEventId: EventSchema.shape.id.nullable(),
      })
    )
    .output(EventWithAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const updatedEvent = await ctx.eventService.updateEventParent(handle, input.eventId, input.parentEventId)
        const attendance = updatedEvent.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, updatedEvent.attendanceId)
          : null
        return { event: updatedEvent, attendance }
      })
    }),

  findParentEvent: procedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .output(EventWithAttendanceSchema.nullable())
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const childEvent = await ctx.eventService.findEventById(handle, input.eventId)

        if (!childEvent?.parentId) {
          return null
        }

        const event = await ctx.eventService.findEventById(handle, childEvent.parentId)

        if (!event) {
          return null
        }

        const attendance = event?.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, event.attendanceId)
          : null

        return { event, attendance }
      })
    }),

  findChildEvents: procedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .output(EventWithAttendanceSchema.array())
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const events = await ctx.eventService.findByParentEventId(handle, input.eventId)

        const attendances = await ctx.attendanceService.getAttendancesByIds(
          handle,
          events.map((item) => item.attendanceId).filter((id) => id !== null)
        )

        const eventsWithAttendance = events.map((event) => ({
          event,
          attendance: attendances.find((attendance) => attendance.id === event.attendanceId) || null,
        }))

        return eventsWithAttendance
      })
    }),

  findUnansweredByUser: authenticatedProcedure
    .input(UserSchema.shape.id)
    .output(EventSchema.array())
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => await ctx.eventService.findUnansweredByUser(handle, input))
    ),

  isOrganizer: authenticatedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .output(z.boolean())
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.getEventById(handle, input.eventId)
        const groups = await ctx.groupService.findManyByMemberUserId(handle, ctx.principal.subject)

        return groups.some((group) => event.hostingGroups.some((organizer) => organizer.slug === group.slug))
      })
    }),

  findManyDeregisterReasonsWithEvent: staffProcedure.input(PaginateInputSchema).query(async ({ ctx, input }) => {
    return ctx.executeTransaction(async (handle) => {
      const rows = await ctx.eventService.findManyDeregisterReasonsWithEvent(handle, input)

      return {
        items: rows,
        nextCursor: rows.at(-1)?.id,
      }
    })
  }),

  createFileUpload: staffProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .output(z.custom<PresignedPost>())
    .mutation(async ({ ctx, input }) => {
      return ctx.executeTransaction(async (handle) => {
        return ctx.eventService.createFileUpload(handle, input.filename, input.contentType, ctx.principal.subject)
      })
    }),
})
