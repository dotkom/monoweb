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
    .input(z.object({ documentationJWT: FeideDocumentationSchema }))
    .mutation(async ({ input, ctx }) => ctx.membershipService.updateAutomatically())
})
