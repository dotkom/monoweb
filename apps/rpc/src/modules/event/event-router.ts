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
import { BasePaginateInputSchema } from "../../query"
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
        companies: z.array(CompanySchema.shape.id),
      })
    )
    .output(EventWithAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const eventWithoutOrganizers = await ctx.eventService.createEvent(handle, input.event)
        const event = await ctx.eventService.updateEventOrganizers(
          handle,
          eventWithoutOrganizers.id,
          new Set(input.groupIds),
          new Set(input.companies)
        )
        return { event, attendance: null }
      })
    }),

  edit: staffProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        groupIds: z.array(GroupSchema.shape.slug),
        companies: z.array(CompanySchema.shape.id),
      })
    )
    .output(EventWithAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const updatedEventWithoutOrganizers = await ctx.eventService.updateEvent(handle, input.id, input.event)
        const updatedEvent = await ctx.eventService.updateEventOrganizers(
          handle,
          updatedEventWithoutOrganizers.id,
          new Set(input.groupIds),
          new Set(input.companies)
        )
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
      return ctx.executeTransaction(async (handle) => {
        return await ctx.eventService.deleteEvent(handle, input.id)
      })
    }),

  all: procedure
    .input(BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).optional())
    .output(
      z.object({
        items: EventWithAttendanceSchema.array(),
        nextCursor: EventSchema.shape.id.optional(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const events = await ctx.eventService.findEvents(handle, { ...input?.filter }, input)
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
        const { id, ...page } = input
        const events = await ctx.eventService.findEventsByAttendingUserId(handle, id, page)
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
      return ctx.executeTransaction(async (handle) => {
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
      return ctx.executeTransaction(async (handle) => {
        const updatedEvent = await ctx.eventService.updateEventParent(handle, input.eventId, input.parentEventId)
        const attendance = updatedEvent.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, updatedEvent.attendanceId)
          : null
        return { event: updatedEvent, attendance }
      })
    }),
})
