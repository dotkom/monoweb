import { PrivacyPermissionsWriteSchema } from "@dotkomonline/types"
import { protectedProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"

export const userRouter = t.router({
  getUsers: t.procedure.input(z.object({ limit: z.number().optional() })).query(async ({ input, ctx }) => {
    return await ctx.userService.getClerkUsers(input.limit ?? 50)
  }),
  getPrivacyPermissionssByUserId: protectedProcedure.input(z.string()).query(({ input, ctx }) => {
    return ctx.userService.getPrivacyPermissionsByUserId(input)
  }),
  updatePrivacyPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: PrivacyPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.userService.updatePrivacyPermissionsForUserId(input.id, input.data)
    }),
})
