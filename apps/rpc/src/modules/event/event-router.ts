import {
  AttendanceEventSchema,
  AttendanceWriteSchema,
  CompanySchema,
  EventFilterQuerySchema,
  EventSchema,
  EventWriteSchema,
  GroupSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { feedbackRouter } from "./feedback-router"

export const eventRouter = t.router({
  attendance: attendanceRouter,
  feedback: feedbackRouter,

  get: procedure
    .input(EventSchema.shape.id)
    .output(AttendanceEventSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.getEventById(handle, input)
        const attendance = event.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, event.attendanceId)
          : null
        return { ...event, attendance }
      })
    ),

  find: procedure
    .input(EventSchema.shape.id)
    .output(AttendanceEventSchema.nullable())
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.findEventById(handle, input)
        if (!event) {
          return null
        }
        const attendance = event.attendanceId
          ? await ctx.attendanceService.findAttendanceById(handle, event.attendanceId)
          : null
        return { ...event, attendance }
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
    .output(AttendanceEventSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const eventWithoutOrganizers = await ctx.eventService.createEvent(handle, input.event)
        const event = await ctx.eventService.updateEventOrganizers(
          handle,
          eventWithoutOrganizers.id,
          new Set(input.groupIds),
          new Set(input.companies)
        )
        return { ...event, attendance: null }
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
    .output(AttendanceEventSchema)
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
        return { ...updatedEvent, attendance }
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
      z
        .object({
          items: AttendanceEventSchema.array(),
          nextCursor: EventSchema.shape.id.optional(),
        })
        .promise()
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const events = await ctx.eventService.findEvents(handle, { ...input?.filter }, input)
        const attendances = await ctx.attendanceService.getAttendancesByIds(
          handle,
          events.map((item) => item.attendanceId).filter((id) => id !== null)
        )

        const eventsWithAttendance = events.map((event) => ({
          ...event,
          attendance: attendances.find((attendance) => attendance.id === event.attendanceId) || null,
        }))

        return {
          items: eventsWithAttendance,
          nextCursor: events.at(-1)?.id,
        }
      })
    ),

  allByAttendingUserId: procedure
    .input(z.object({ id: UserSchema.shape.id, page: BasePaginateInputSchema.extend({ filter: EventFilterQuerySchema.optional() }).optional() }))
    .output(AttendanceEventSchema.array())
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const events = await ctx.eventService.findEventsByAttendingUserId(handle, input.id)
        const attendances = await ctx.attendanceService.getAttendancesByIds(
          handle,
          events.map((item) => item.attendanceId).filter((id) => id !== null)
        )

        return events.map((event) => ({
          ...event,
          attendance: attendances.find((attendance) => attendance.id === event.attendanceId) || null,
        }))
      })
    ),

  addAttendance: procedure
    .input(
      z.object({
        values: AttendanceWriteSchema,
        eventId: EventSchema.shape.id,
      })
    )
    .output(AttendanceEventSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.createAttendance(handle, input.values)
        const event = await ctx.eventService.updateEventAttendance(handle, input.eventId, attendance.id)
        return { ...event, attendance }
      })
    }),
})
