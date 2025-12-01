import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { ArticleFilterQuerySchema, ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

export type CreateArticleInput = inferProcedureInput<typeof createArticleProcedure>
export type CreateArticleOutput = inferProcedureOutput<typeof createArticleProcedure>
const createArticleProcedure = procedure
  .input(
    z.object({
      article: ArticleWriteSchema,
      tags: z.array(ArticleTagSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const article = await ctx.articleService.create(ctx.handle, input.article)
    const tags = await ctx.articleService.setTags(ctx.handle, article.id, input.tags)
    return {
      ...article,
      tags,
    }
  })

export type EditArticleInput = inferProcedureInput<typeof editArticleProcedure>
export type EditArticleOutput = inferProcedureOutput<typeof editArticleProcedure>
const editArticleProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      input: ArticleWriteSchema.partial(),
      tags: z.array(ArticleTagSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => {
      const article = await ctx.articleService.update(handle, input.id, input.input)
      const tags = await ctx.articleService.setTags(handle, input.id, input.tags)
      return { ...article, tags }
    })
  })

export type AllArticlesInput = inferProcedureInput<typeof allArticlesProcedure>
export type AllArticlesOutput = inferProcedureOutput<typeof allArticlesProcedure>
const allArticlesProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => ctx.articleService.findMany(ctx.handle, {}, input))

export type FindArticlesInput = inferProcedureInput<typeof findArticlesProcedure>
export type FindArticlesOutput = inferProcedureOutput<typeof findArticlesProcedure>
const findArticlesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filters: ArticleFilterQuerySchema }))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    const items = await ctx.articleService.findMany(ctx.handle, input.filters, input)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type FindArticleInput = inferProcedureInput<typeof findArticleProcedure>
export type FindArticleOutput = inferProcedureOutput<typeof findArticleProcedure>
const findArticleProcedure = procedure
  .input(ArticleSchema.shape.id)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => ctx.articleService.findById(ctx.handle, input))

export type GetArticleInput = inferProcedureInput<typeof getArticleProcedure>
export type GetArticleOutput = inferProcedureOutput<typeof getArticleProcedure>
const getArticleProcedure = procedure
  .input(ArticleSchema.shape.id)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => ctx.articleService.getById(ctx.handle, input))

export type FindRelatedArticlesInput = inferProcedureInput<typeof findRelatedArticlesProcedure>
export type FindRelatedArticlesOutput = inferProcedureOutput<typeof findRelatedArticlesProcedure>
const findRelatedArticlesProcedure = procedure
  .input(ArticleSchema)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => ctx.articleService.findRelated(ctx.handle, input))

export type FindFeaturedArticlesInput = inferProcedureInput<typeof findFeaturedArticlesProcedure>
export type FindFeaturedArticlesOutput = inferProcedureOutput<typeof findFeaturedArticlesProcedure>
const findFeaturedArticlesProcedure = procedure
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ ctx }) => ctx.articleService.findFeatured(ctx.handle))

export type GetArticleTagsInput = inferProcedureInput<typeof getArticleTagsProcedure>
export type GetArticleTagsOutput = inferProcedureOutput<typeof getArticleTagsProcedure>
const getArticleTagsProcedure = procedure
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ ctx }) => ctx.articleService.getTags(ctx.handle))

export type FindArticleTagsOrderedByPopularityInput = inferProcedureInput<
  typeof findArticleTagsOrderedByPopularityProcedure
>
export type FindArticleTagsOrderedByPopularityOutput = inferProcedureOutput<
  typeof findArticleTagsOrderedByPopularityProcedure
>
const findArticleTagsOrderedByPopularityProcedure = procedure
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ ctx }) => ctx.articleService.findTagsOrderedByPopularity(ctx.handle))

export type AddArticleTagInput = inferProcedureInput<typeof addArticleTagProcedure>
export type AddArticleTagOutput = inferProcedureOutput<typeof addArticleTagProcedure>
const addArticleTagProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      tag: ArticleTagSchema.shape.name,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => ctx.articleService.addTag(handle, input.id, input.tag))
  })

export type RemoveArticleTagInput = inferProcedureInput<typeof removeArticleTagProcedure>
export type RemoveArticleTagOutput = inferProcedureOutput<typeof removeArticleTagProcedure>
const removeArticleTagProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      tag: ArticleTagSchema.shape.name,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => ctx.articleService.removeTag(handle, input.id, input.tag))
  })

export type CreateArticleFileUploadInput = inferProcedureInput<typeof createArticleFileUploadProcedure>
export type CreateArticleFileUploadOutput = inferProcedureOutput<typeof createArticleFileUploadProcedure>
const createArticleFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return await ctx.articleService.createFileUpload(
      ctx.handle,
      input.filename,
      input.contentType,
      ctx.principal.subject
    )
  })

export const articleRouter = t.router({
  create: createArticleProcedure,
  edit: editArticleProcedure,
  all: allArticlesProcedure,
  findArticles: findArticlesProcedure,
  find: findArticleProcedure,
  get: getArticleProcedure,
  related: findRelatedArticlesProcedure,
  featured: findFeaturedArticlesProcedure,
  getTags: getArticleTagsProcedure,
  findTagsOrderedByPopularity: findArticleTagsOrderedByPopularityProcedure,
  addTag: addArticleTagProcedure,
  removeTag: removeArticleTagProcedure,
  createFileUpload: createArticleFileUploadProcedure,
})
