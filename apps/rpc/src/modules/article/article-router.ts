import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { Article, ArticleTag, ArticleWrite } from "./article-types"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"
import { ArticleFilterQuery } from "./article-service"
import { parseOutputType } from "../../invariant"
import { inferProcedureInput } from "@trpc/server"

export const ArticleDTO = Article.pick({
  id: true,
  slug: true,
  title: true,
  author: true,
  photographer: true,
  imageUrl: true,
  excerpt: true,
  content: true,
  isFeatured: true,
  vimeoId: true,
  createdAt: true,
  updatedAt: true,
  tags: true,
})

function buildCreateArticleProcedure() {
  const inputSchema = z.object({
    article: ArticleWrite,
    tags: z.array(ArticleTag.shape.name),
  })
  const outputSchema = ArticleDTO

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withAuthentication())
    .use(withAuthorization(isEditor()))
    .use(withDatabaseTransaction())
    .use(withAuditLogEntry())
    .mutation(async ({ input, ctx }) => {
      const { id } = await ctx.articleService.create(ctx.handle, input.article)
      await ctx.articleService.setTags(ctx.handle, id, input.tags)
      const article = await ctx.articleService.getById(ctx.handle, id)
      return parseOutputType(outputSchema, article)
    })
}

function buildEditArticleProcedure() {
  const inputSchema = z.object({
    id: Article.shape.id,
    input: ArticleWrite.partial(),
    tags: z.array(ArticleTag.shape.name),
  })
  const outputSchema = ArticleDTO

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withAuthentication())
    .use(withAuthorization(isEditor()))
    .use(withDatabaseTransaction())
    .use(withAuditLogEntry())
    .mutation(async ({ input, ctx }) => {
      const { id } = await ctx.articleService.update(ctx.handle, input.id, input.input)
      await ctx.articleService.setTags(ctx.handle, input.id, input.tags)
      const article = await ctx.articleService.getById(ctx.handle, id)
      return parseOutputType(outputSchema, article)
    })
}

function buildFindArticlesProcedure() {
  const inputSchema = BasePaginateInputSchema.extend({ filters: ArticleFilterQuery })
  const outputSchema = z.object({
    items: ArticleDTO.array(),
    nextCursor: Article.shape.id.optional(),
  })

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ input, ctx }) => {
      const items = await ctx.articleService.findMany(ctx.handle, input.filters, input)

      return parseOutputType(outputSchema, {
        items,
        nextCursor: items.at(-1)?.id,
      })
    })
}

function buildFindArticleProcedure() {
  const inputSchema = Article.shape.id
  const outputSchema = ArticleDTO.nullable()

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ input, ctx }) => {
      const article = await ctx.articleService.findById(ctx.handle, input)
      return parseOutputType(outputSchema, article)
    })
}

function buildGetArticleProcedure() {
  const inputSchema = Article.shape.id
  const outputSchema = ArticleDTO

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ input, ctx }) => {
      const article = await ctx.articleService.getById(ctx.handle, input)
      return parseOutputType(outputSchema, article)
    })
}

function buildFindRelatedArticlesProcedure() {
  // TODO: take id here instead
  const inputSchema = Article
  const outputSchema = ArticleDTO.array()

  return (
    procedure
      // TODO: Accept article id here instead
      .input(inputSchema)
      .output(outputSchema)
      .use(withDatabaseTransaction())
      .query(async ({ input, ctx }) => {
        const articles = await ctx.articleService.findRelated(ctx.handle, input)
        return parseOutputType(outputSchema, articles)
      })
  )
}

function buildFindFeaturedArticlesProcedure() {
  const inputSchema = z.void()
  const outputSchema = ArticleDTO.array()

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ ctx }) => {
      const result = await ctx.articleService.findFeatured(ctx.handle)
      return parseOutputType(outputSchema, result)
    })
}

function buildGetArticleTagsProcedure() {
  const inputSchema = z.void()
  const outputSchema = z.array(ArticleTag)

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ ctx }) => {
      const result = await ctx.articleService.getTags(ctx.handle)
      return parseOutputType(outputSchema, result)
    })
}

function buildFindArticleTagsOrderedByPopularityProcedure() {
  const inputSchema = z.void()
  const outputSchema = z.array(ArticleTag)

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withDatabaseTransaction())
    .query(async ({ ctx }) => {
      const result = await ctx.articleService.findTagsOrderedByPopularity(ctx.handle)
      return parseOutputType(outputSchema, result)
    })
}

function buildAddArticleTagProcedure() {
  const inputSchema = z.object({
    id: Article.shape.id,
    tag: ArticleTag.shape.name,
  })
  const outputSchema = z.unknown()

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withAuthentication())
    .use(withAuthorization(isEditor()))
    .use(withDatabaseTransaction())
    .use(withAuditLogEntry())
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.articleService.addTag(ctx.handle, input.id, input.tag)
      return parseOutputType(outputSchema, result)
    })
}

function buildRemoveArticleTagProcedure() {
  const inputSchema = z.object({
    id: Article.shape.id,
    tag: ArticleTag.shape.name,
  })
  const outputSchema = z.unknown()

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withAuthentication())
    .use(withAuthorization(isEditor()))
    .use(withDatabaseTransaction())
    .use(withAuditLogEntry())
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.articleService.removeTag(ctx.handle, input.id, input.tag)
      return parseOutputType(outputSchema, result)
    })
}

function buildCreateArticleFileUploadProcedure() {
  const inputSchema = z.object({
    filename: z.string(),
    contentType: z.string(),
  })
  const outputSchema = z.custom<PresignedPost>()

  return procedure
    .input(inputSchema)
    .output(outputSchema)
    .use(withAuthentication())
    .use(withAuthorization(isEditor()))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.articleService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
      return parseOutputType(outputSchema, result)
    })
}

export const articleRouter = t.router({
  create: buildCreateArticleProcedure(),
  edit: buildEditArticleProcedure(),
  findArticles: buildFindArticlesProcedure(),
  find: buildFindArticleProcedure(),
  get: buildGetArticleProcedure(),
  related: buildFindRelatedArticlesProcedure(),
  featured: buildFindFeaturedArticlesProcedure(),
  getTags: buildGetArticleTagsProcedure(),
  findTagsOrderedByPopularity: buildFindArticleTagsOrderedByPopularityProcedure(),
  addTag: buildAddArticleTagProcedure(),
  removeTag: buildRemoveArticleTagProcedure(),
  createFileUpload: buildCreateArticleFileUploadProcedure(),
})
