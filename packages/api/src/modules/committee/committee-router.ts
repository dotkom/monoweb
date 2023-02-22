import { CommitteeWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { t } from "../../trpc"

export const committeeRouter = t.router({
  create: t.procedure.input(CommitteeWriteSchema).mutation(({ input, ctx }) => {
    return ctx.committeeService.create(input)
  }),
  all: t.procedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.committeeService.getCommittees(input.limit, input.offset)
    }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.committeeService.getCommittee(input)
  }),
})
