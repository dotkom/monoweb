import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"

import { t } from "../../trpc"

export const eventRouter = t.router({
  create: t.procedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.createEvent(input)
  }),
  all: t.procedure.query(({ ctx }) => {
    return ctx.eventService.getEvents()
  }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
  }),
})
