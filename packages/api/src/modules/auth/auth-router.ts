import { z } from "zod"
import { t } from "../../trpc"

export const authRouter = t.router({
  getUsers: t.procedure.input(z.object({ limit: z.number().optional() })).query(async ({ input, ctx }) => {
    return await ctx.userService.getUsers(input.limit ?? 50)
  }),
})
