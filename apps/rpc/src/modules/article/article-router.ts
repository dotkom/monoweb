import { ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { adminProcedure, publicProcedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: adminProcedure
    .input(
      z.object({
        article: ArticleWriteSchema,
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const article = await ctx.articleService.create(handle, input.article)
        const tags = await ctx.articleService.setTags(handle, article.id, input.tags)
        return {
          ...article,
          tags,
        }
      })
    ),
  edit: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.update(handle, input.id, input.input))
    ),
  editWithTags: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        article: ArticleWriteSchema.partial(),
        tags: z.array(ArticleTagSchema.shape.name),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const article = await ctx.articleService.update(handle, input.id, input.article)
        const tags = await ctx.articleService.setTags(handle, input.id, input.tags)
        return { ...article, tags }
      })
    ),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getAll(handle, input))
    ),
  get: publicProcedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getById(handle, input))
    ),
  getBySlug: publicProcedure
    .input(ArticleSchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getBySlug(handle, input))
    ),
  allByTags: publicProcedure
    .input(z.array(ArticleTagSchema.shape.name))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getAllByTags(handle, input))
    ),
  related: publicProcedure
    .input(ArticleSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.getRelated(handle, input))
    ),
  featured: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.articleService.getFeatured(handle))
  ),
  getTags: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.articleService.getTags(handle))
  ),
  addTag: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.addTag(handle, input.id, input.tag))
    ),
  removeTag: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.articleService.removeTag(handle, input.id, input.tag))
    ),
})
