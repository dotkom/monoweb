import { PaginateInputSchema } from "@dotkomonline/core"
import { CommitteeWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { t } from "../../trpc"

export const committeeRouter = t.router({
  create: t.procedure.input(CommitteeWriteSchema).mutation(({ input, ctx }) => {
    return ctx.committeeService.createCommittee(input)
  }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.committeeService.getCommittees(input.take, input.cursor)
  }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.committeeService.getCommittee(input)
  }),
})
