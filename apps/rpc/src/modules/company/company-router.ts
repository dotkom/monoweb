import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export const companyRouter = t.router({
  create: staffProcedure.input(CompanyWriteSchema).mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => ctx.companyService.create(handle, input))
  }),

  edit: staffProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.companyService.update(handle, changes.id, changes.input)
      )
    }),

  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.findMany(handle, input))
    ),

  findById: procedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.findById(handle, input))
    ),

  getById: procedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getById(handle, input))
    ),

  findBySlug: procedure
    .input(CompanySchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.findBySlug(handle, input))
    ),

  getBySlug: procedure
    .input(CompanySchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getBySlug(handle, input))
    ),

  createFileUpload: staffProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .output(z.custom<PresignedPost>())
    .mutation(async ({ ctx, input }) => {
      return ctx.executeTransaction(async (handle) => {
        return ctx.companyService.createFileUpload(handle, input.filename, input.contentType, ctx.principal.subject)
      })
    }),
})
