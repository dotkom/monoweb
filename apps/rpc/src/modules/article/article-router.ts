import { ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: authenticatedProcedure
    .input(
      z.object({
        article: ArticleWriteSchema,
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) => {
        const article = await ctx.articleService.create(handle, input.article)
        const tags = await ctx.articleService.setTags(handle, article.id, input.tags)
        return {
          ...article,
          tags,
        }
      })
    }),

  edit: authenticatedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) => {
        const article = ctx.articleService.update(handle, input.id, input.input)
        const tags = ctx.articleService.setTags(handle, input.id, input.tags)
        return { ...article, tags }
      })
    }),

  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getAll(handle, input))
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

  addTag: authenticatedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) => ctx.articleService.addTag(handle, input.id, input.tag))
    }),

  removeTag: authenticatedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) => ctx.articleService.removeTag(handle, input.id, input.tag))
    }),
})
