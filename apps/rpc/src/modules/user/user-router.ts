import {
  MembershipSchema,
  MembershipWriteSchema,
  UserFilterQuerySchema,
  UserSchema,
  UserWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: procedure
    .input(BasePaginateInputSchema.extend({ filter: UserFilterQuerySchema.optional() }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const items = await ctx.userService.findUsers(handle, { ...input.filter }, input)

        return {
          items,
          nextCursor: items.at(-1)?.id,
        }
      })
    ),
  get: procedure.input(UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, input)
    })
  ),
  getByProfileSlug: procedure.input(UserSchema.shape.profileSlug).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getByProfileSlug(handle, input)
    })
  ),
  findByProfileSlug: procedure.input(UserSchema.shape.profileSlug).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.findByProfileSlug(handle, input)
    })
  ),
  register: procedure.input(UserSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.register(handle, input)
    })
  ),
  createMembership: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        data: MembershipWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.createMembership(handle, input.userId, input.data)
      })
    ),
  updateMembership: staffProcedure
    .input(
      z.object({
        membershipId: MembershipSchema.shape.id,
        data: MembershipWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.updateMembership(handle, input.membershipId, input.data)
      })
    ),
  getMe: authenticatedProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, ctx.principal.subject)
    })
  ),
  update: procedure
    .input(
      z.object({
        id: UserSchema.shape.id,
        input: UserWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.update(handle, changes.id, changes.input)
      })
    ),
  isStaff: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      ctx.authorize.requireAffiliation()
      return true
    } catch {
      return false
    }
  }),
})
