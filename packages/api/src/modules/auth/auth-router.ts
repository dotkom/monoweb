import { UserSchema, UserWriteSchema } from "@dotkomonline/types"
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
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.userService.login(input.email, input.password, input.challenge)
      return result
    }),
  signup: t.procedure.input(UserWriteSchema.extend({ password: z.string() })).mutation(async ({ input, ctx }) => {
    const user = await ctx.userService.signUp(input, input.password)
    return user
  }),
  consent: t.procedure.input(z.object({ challenge: z.string() })).mutation(async ({ input, ctx }) => {
    const result = await ctx.userService.consent(input.challenge)
    return result
  }),
  skipLogin: t.procedure.input(z.object({ challenge: z.string() })).mutation(({ input, ctx }) => {
    return ctx.userService.skipLogin(input.challenge)
  }),
})
