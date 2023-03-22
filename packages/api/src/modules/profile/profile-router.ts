import { ProfileWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { publicProcedure, t } from "../../trpc"

export const profileRouter = t.router({
  get: publicProcedure.input(z.string()).mutation(({ input, ctx }) => {
    return ctx.profileService.getPrivacy(input)
  }),
  create: publicProcedure.input(ProfileWriteSchema).mutation(({ input, ctx }) => {
    return ctx.profileService.createProfile(input)
  }),
})
