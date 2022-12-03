import { z } from "zod"

import { t } from "../../trpc"

export const authRouter = t.router({
  login: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        challenge: z.string(),
      })
    )
    .mutation((_req) => {
      console.log(_req)
      return { msg: "hello world" }
    }),
  signup: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.userService.register(input.email, input.password)
      return user
    }),
})
