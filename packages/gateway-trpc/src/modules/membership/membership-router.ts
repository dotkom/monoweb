import { FeideDocumentationSchema, MembershipSchema, UserIdSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"

export const membershipRouter = t.router({
  create: protectedProcedure
    .input(z.object({ id: UserIdSchema, values: MembershipSchema }))
    .mutation(async ({ input, ctx }) => ctx.membershipService.create(input.id, input.values)),

  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.membershipService.getAll(input.take, input.cursor)),

  get: protectedProcedure
    .input(UserIdSchema)
    .query(async ({ input, ctx }) => ctx.membershipService.getById(input)),
  
  update: protectedProcedure
    .input(
      z.object({
        id: UserIdSchema,
        values: MembershipSchema,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.membershipService.update(input.id, input.values)),
  
  getDocumentation: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .query(async ({ input, ctx }) => ctx.membershipService.getDocumentation(input.accessToken)),
  
  updateAutomatically: protectedProcedure
    .input(z.object({ documentationJWT: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.userService.getByAuth0Id(ctx.auth.userId)

      if (!user) {
        throw new Error("User not found")
      }

      ctx.membershipService.updateAutomatically(user.id, input.documentationJWT)
    }),
})
