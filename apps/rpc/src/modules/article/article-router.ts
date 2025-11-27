import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { ArticleFilterQuerySchema, ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: staffProcedure
    .input(
      z.object({
        article: ArticleWriteSchema,
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const article = await ctx.articleService.create(handle, input.article)
        const tags = await ctx.articleService.setTags(handle, article.id, input.tags)
        return {
          ...article,
          tags,
        }
      })
    }),

  edit: staffProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => {
        const article = await ctx.articleService.update(handle, input.id, input.input)
        const tags = await ctx.articleService.setTags(handle, input.id, input.tags)
        return { ...article, tags }
      })
    }),

  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getAll(handle, input))
    ),

  findArticles: procedure
    .input(BasePaginateInputSchema.extend({ filters: ArticleFilterQuerySchema }))
    .query(async ({ input, ctx }) => {
      const items = await ctx.executeTransaction(async (handle) =>
        ctx.articleService.findMany(handle, input.filters, input)
      )

      return {
        items,
        nextCursor: items.at(-1)?.id,
      }
    }),

  find: procedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.findById(handle, input))
    ),

  get: procedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getById(handle, input))
    ),

  related: procedure
    .input(ArticleSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getRelated(handle, input))
    ),

  featured: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.articleService.getFeatured(handle))
  ),

  getTags: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.articleService.getTags(handle))
  ),

  findTagsOrderedByPopularity: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.articleService.findTagsOrderedByPopularity(handle))
  ),

  addTag: staffProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => ctx.articleService.addTag(handle, input.id, input.tag))
    }),

  removeTag: staffProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) => ctx.articleService.removeTag(handle, input.id, input.tag))
    }),

  createFileUpload: staffProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .output(z.custom<PresignedPost>())
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        return await ctx.articleService.createFileUpload(
          handle,
          input.filename,
          input.contentType,
          ctx.principal.subject
        )
      })
    }),
})
