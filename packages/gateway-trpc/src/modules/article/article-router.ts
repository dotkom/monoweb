import { PaginateInputSchema } from "@dotkomonline/core"
import { ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const articleRouter = t.router({
  create: protectedProcedure
    .input(ArticleWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.articleService.create(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: ArticleSchema.shape.id,
        input: ArticleWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.articleService.update(input.id, input.input)),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.articleService.getAll(input)),
  get: publicProcedure
    .input(ArticleSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.articleService.getById(input)),
  getBySlug: publicProcedure
    .input(ArticleSchema.shape.slug)
    .query(async ({ input, ctx }) => await ctx.articleService.getBySlug(input)),
  getTags: publicProcedure
    .query(async ({ ctx }) => await ctx.articleService.getTags()),
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
