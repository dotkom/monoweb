import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { CompanySchema, EventSchema, EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../utils/db-utils"

export const markRouter = t.router({
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.markService.getMarks(2)
  }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.markService.getMark(input)
  }),
})
