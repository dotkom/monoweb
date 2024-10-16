import { PaginateInputSchema } from "@dotkomonline/core"
import { PrivacyPermissionsWriteSchema, UserSchema, UserEditableFieldsSchema, UserWriteSchema, UserIdSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.userService.getAll(input.take)),
  get: publicProcedure.input(UserSchema.shape.id).query(async ({ input, ctx }) => ctx.userService.getById(input)),
  create: protectedProcedure.input(UserWriteSchema).mutation(async ({ input, ctx }) => ctx.userService.create(input)),
  getByAuth0Id: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ctx.userService.getByAuth0Id(input)),
  getMe: protectedProcedure.query(async ({ ctx }) => ctx.userService.getByAuth0Id(ctx.auth.userId)),
  update: protectedProcedure
    .input(
      z.object({
        data: UserWriteSchema,
        id: UserIdSchema
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.userService.updateByAuth0Id(changes.id, changes.data)),
  getPrivacyPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ctx.userService.getPrivacyPermissionsByUserId(input)),
  updatePrivacyPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: PrivacyPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.userService.updatePrivacyPermissionsForUserId(input.id, input.data)),
  searchByFullName: protectedProcedure
    .input(z.object({ searchQuery: z.string(), paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.userService.searchByFullName(input.searchQuery, input.paginate.take)),
  
  signup: protectedProcedure
    .input(z.object({ signupInformation: UserEditableFieldsSchema, feideDocumentationJWT: z.string() }))
    .mutation(async ({ input, ctx }) => 
      ctx.userService.signup(ctx.auth.userId, input.signupInformation, input.feideDocumentationJWT)
    ),

  updateMe: protectedProcedure
    .input(UserEditableFieldsSchema)
    .mutation(async ({ input, ctx }) => ctx.userService.updateByAuth0Id(ctx.auth.userId, input)),
})
