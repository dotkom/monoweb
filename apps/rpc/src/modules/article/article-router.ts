import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import { canManageArticles } from "../../permissions/article-permissions"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { ArticleFilterQuerySchema, ArticleSchema, ArticleTagSchema, ArticleWriteSchema } from "./article"

const createArticleProcedure = procedure
  .input(
    z.object({
      article: ArticleWriteSchema,
      tags: z.array(ArticleTagSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canManageArticles(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const article = await ctx.articleService.create(ctx.handle, input.article)
    const tags = await ctx.articleService.setTags(ctx.handle, article.id, input.tags)

    ctx.setAuditTransactionName(`Create Article(ID=${article.id},Title=${article.title})`)

    return {
      ...article,
      tags,
    }
  })

const editArticleProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      input: ArticleWriteSchema.partial(),
      tags: z.array(ArticleTagSchema.shape.name),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canManageArticles(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const article = await ctx.articleService.update(ctx.handle, input.id, input.input)
    const tags = await ctx.articleService.setTags(ctx.handle, input.id, input.tags)

    ctx.setAuditTransactionName(`Update Article(ID=${article.id},Title=${article.title})`)

    return { ...article, tags }
  })

const allArticlesProcedure = procedure
  .input(PaginateInputSchema)
  .query(async ({ input, ctx }) => ctx.articleService.findMany(ctx.prisma, {}, input))

const findArticlesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filters: ArticleFilterQuerySchema }))
  .query(async ({ input, ctx }) => {
    const items = await ctx.articleService.findMany(ctx.prisma, input.filters, input)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

const findArticleProcedure = procedure
  .input(ArticleSchema.shape.id)
  .query(async ({ input, ctx }) => ctx.articleService.findById(ctx.prisma, input))

const findArticleBySlugProcedure = procedure
  .input(ArticleSchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.articleService.findBySlug(ctx.prisma, input))

const getArticleProcedure = procedure
  .input(ArticleSchema.shape.id)
  .query(async ({ input, ctx }) => ctx.articleService.getById(ctx.prisma, input))

const getArticleBySlugProcedure = procedure
  .input(ArticleSchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.articleService.getBySlug(ctx.prisma, input))

const findRelatedArticlesProcedure = procedure
  .input(ArticleSchema)
  .query(async ({ input, ctx }) => ctx.articleService.findRelated(ctx.prisma, input))

const getArticleTagsProcedure = procedure.query(async ({ ctx }) => ctx.articleService.getTags(ctx.prisma))

const findArticleTagsOrderedByPopularityProcedure = procedure.query(async ({ ctx }) =>
  ctx.articleService.findTagsOrderedByPopularity(ctx.prisma)
)

const addArticleTagProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      tag: ArticleTagSchema.shape.name,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canManageArticles(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.articleService.addTag(ctx.handle, input.id, input.tag)
    const article = await ctx.articleService.getById(ctx.handle, input.id)

    ctx.setAuditTransactionName(`Add ArticleTag(Name=${input.tag}) to Article(ID=${input.id},Title=${article.title})`)
  })

const removeArticleTagProcedure = procedure
  .input(
    z.object({
      id: ArticleSchema.shape.id,
      tag: ArticleTagSchema.shape.name,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canManageArticles(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.articleService.removeTag(ctx.handle, input.id, input.tag)
    const article = await ctx.articleService.getById(ctx.handle, input.id)

    ctx.setAuditTransactionName(
      `Remove ArticleTag(Name=${input.tag}) from Article(ID=${input.id},Title=${article.title})`
    )
  })

const createArticleFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canManageArticles(principal))))
  .mutation(async ({ input, ctx }) => {
    return await ctx.articleService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export const articleRouter = t.router({
  create: createArticleProcedure,
  edit: editArticleProcedure,
  all: allArticlesProcedure,
  findArticles: findArticlesProcedure,
  find: findArticleProcedure,
  findBySlug: findArticleBySlugProcedure,
  get: getArticleProcedure,
  getBySlug: getArticleBySlugProcedure,
  related: findRelatedArticlesProcedure,
  getTags: getArticleTagsProcedure,
  findTagsOrderedByPopularity: findArticleTagsOrderedByPopularityProcedure,
  addTag: addArticleTagProcedure,
  removeTag: removeArticleTagProcedure,
  createFileUpload: createArticleFileUploadProcedure,
})
