import { PaginateInputSchema } from "@dotkomonline/core"
import { ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: adminProcedure
    .input(
      z.object({
        article: ArticleWriteSchema,
        tags: ArticleSchema.shape.tags,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.articleService.create(input.article)
      const tags = await ctx.articleService.setTags(article.id, input.tags)
      return {
        ...article,
        tags,
      }
    }),
  edit: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.update(input.id, input.input)),
  editWithTags: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        article: ArticleWriteSchema.partial(),
        tags: ArticleSchema.shape.tags,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const article = await ctx.articleService.update(input.id, input.article)
      const tags = await ctx.articleService.setTags(input.id, input.tags)

      return { ...article, tags }
    }),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.articleService.getAll(input)),
  get: publicProcedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.articleService.getById(input)),
  getBySlug: publicProcedure
    .input(ArticleSchema.shape.slug)
    .query(async ({ input, ctx }) => await ctx.articleService.getBySlug(input)),
  allByTags: publicProcedure
    .input(z.array(ArticleTagSchema.shape.name))
    .query(async ({ input, ctx }) => await ctx.articleService.getAllByTags(input)),
  related: publicProcedure
    .input(ArticleSchema)
    .query(async ({ input, ctx }) => await ctx.articleService.getRelated(input)),
  getTags: publicProcedure.query(async ({ ctx }) => await ctx.articleService.getTags()),
  addTag: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.addTag(input.id, input.tag)),
  removeTag: adminProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.removeTag(input.id, input.tag)),
})
