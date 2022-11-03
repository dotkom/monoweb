import { z } from "zod"

import { t } from "../../trpc"
import { eventSchema } from "../event/event.js"

export const eventRouter = t.router({
  create: t.procedure.input(eventSchema.omit({ id: true })).mutation(({ input, ctx }) => {
    return ctx.eventService.create(input)
  }),
  all: t.procedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.eventService.getEvents(input.limit, input.offset)
    }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getEvent(input)
  }),
})
