import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"

import { t } from "../../trpc"

export const eventRouter = t.router({
  create: t.procedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.create(input)
  }),
  edit: t.procedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.eventService.editEvent(changes.id, changes)
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
