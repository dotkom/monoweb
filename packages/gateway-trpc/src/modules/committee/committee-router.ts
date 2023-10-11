import { PaginateInputSchema } from "@dotkomonline/core"
import { CommitteeSchema, CommitteeWriteSchema } from "@dotkomonline/types"
import { t } from "../../trpc"

export const committeeRouter = t.router({
  create: t.procedure.input(CommitteeWriteSchema).mutation(({ input, ctx }) => {
    return ctx.committeeService.createCommittee(input)
  }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.committeeService.getCommittees(input.take, input.cursor)
  }),
  get: t.procedure.input(CommitteeSchema.shape.id).query(({ input, ctx }) => {
    return ctx.committeeService.getCommittee(input)
  }),
})
