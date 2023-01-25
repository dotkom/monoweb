import { MarkWriteOptionalDurationSchema } from "@dotkomonline/types"
import { z } from "zod"

import { t } from "../../trpc"

export const markRouter = t.router({
  create: t.procedure.input(MarkWriteOptionalDurationSchema).mutation(({ input, ctx }) => {
    return ctx.markService.createMark(input)
  }),
  all: t.procedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.markService.getMarks(input.limit, input.offset)
    }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.markService.getMark(input)
  }),
})
