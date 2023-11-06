import { ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: protectedProcedure
    .input(ArticleWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.articleService.createArticle(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.updateArticle(input.id, input.input)),
  getAll: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.articleService.getAllArticles(input.take, input.cursor)),
  getById: publicProcedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.articleService.getArticleById(input)),
  getBySlug: publicProcedure
    .input(ArticleSchema.shape.slug)
    .query(async ({ input, ctx }) => await ctx.articleService.getArticleBySlug(input)),
  getTags: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.articleService.getAllTags(input.take, input.cursor)),
  addTag: protectedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.addTag(input.id, input.tag)),
  removeTag: protectedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        tag: ArticleTagSchema.shape.name,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.removeTag(input.id, input.tag)),
})
