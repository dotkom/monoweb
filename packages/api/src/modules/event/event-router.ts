import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { CompanySchema, EventSchema, EventWriteSchema, AttendanceWriteSchema } from "@dotkomonline/types"
import { z } from "zod"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.create(input)
  }),
  edit: protectedProcedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.eventService.editEvent(changes.id, changes)
    }),
  all: publicProcedure.query(({ ctx }) => {
    return ctx.eventService.list()
  }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getById(input)
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
  getCompanies: publicProcedure.input(EventSchema.shape.id).query(({ input, ctx }) => {
    return ctx.eventCompanyService.getCompaniesByEventId(input)
  }),
})
