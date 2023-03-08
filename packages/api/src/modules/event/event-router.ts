import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { CompanySchema, EventSchema, EventWriteSchema, AttendanceWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../utils/db-utils"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.createEvent(input)
  }),
  edit: protectedProcedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.eventService.updateEvent(changes.id, changes)
    }),
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.eventService.getEvents(input.take, input.cursor)
  }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
  }),
  addAttendance: protectedProcedure.input(AttendanceWriteSchema).mutation(async ({ input, ctx }) => {
    const attendance = await ctx.eventService.addAttendance(input.eventId, input)
    return attendance
  }),
  getAttendance: publicProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      const attendance = await ctx.eventService.listAttendance(input.eventId)
      return attendance
    }),
  attend: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendService.registerForEvent(ctx.session.user.id, input.eventId)
      return res
    }),
  addCompany: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCompanyService.addCompany(input.id, input.company)
    }),
  deleteCompany: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCompanyService.deleteCompany(input.id, input.company)
    }),
  getCompanies: publicProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        pagination: PaginateInputSchema,
      })
    )
    .query(({ input, ctx }) => {
      return ctx.eventCompanyService.getCompaniesByEventId(input.id, input.pagination.take, input.pagination.cursor)
    }),
})
