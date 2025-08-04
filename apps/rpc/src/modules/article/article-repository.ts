import type { DBHandle } from "@dotkomonline/db"
import {
  type Article,
  type ArticleFilterQuery,
  type ArticleId,
  ArticleSchema,
  type ArticleSlug,
  type ArticleTag,
  type ArticleTagName,
  ArticleTagSchema,
  type ArticleWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"
import { type Pageable, pageQuery } from "../../query"

export interface ArticleRepository {
  create(handle: DBHandle, input: ArticleWrite): Promise<Article>
  update(handle: DBHandle, articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(handle: DBHandle, page: Pageable): Promise<Article[]>
  getById(handle: DBHandle, articleId: ArticleId): Promise<Article | null>
  getBySlug(handle: DBHandle, slug: ArticleSlug): Promise<Article | null>
  getByTags(handle: DBHandle, tags: ArticleTagName[], page?: Pageable): Promise<Article[]>
  findMany(handle: DBHandle, query: ArticleFilterQuery, page: Pageable): Promise<Article[]>
  getFeatured(handle: DBHandle): Promise<Article[]>
  getMostUsedTags(handle: DBHandle, take: number): Promise<ArticleTag[]>
}

export function getArticleRepository(): ArticleRepository {
  return {
    async create(handle, input) {
      const { tags, ...article } = await handle.article.create({ data: input, include: QUERY_WITH_TAGS })
      return mapArticle(article, tags)
    },
    async update(handle, articleId, input) {
      const { tags, ...article } = await handle.article.update({
        where: { id: articleId },
        data: input,
        include: QUERY_WITH_TAGS,
      })
      return mapArticle(article, tags)
    },
    async getAll(handle, page) {
      const articles = await handle.article.findMany({
        include: QUERY_WITH_TAGS,
        ...pageQuery(page),
      })
      return articles.map((article) => mapArticle(article, article.tags))
    },
    async getById(handle, articleId) {
      const article = await handle.article.findUnique({ where: { id: articleId }, include: QUERY_WITH_TAGS })
      return article ? mapArticle(article, article.tags) : null
    },
    async getBySlug(handle, slug) {
      const article = await handle.article.findUnique({ where: { slug }, include: QUERY_WITH_TAGS })
      return article ? mapArticle(article, article.tags) : null
    },
    async getByTags(handle, tags, page) {
      const articles = await handle.article.findMany({
        where: {
          tags: {
            some: {
              tagName: {
                in: tags,
              },
            },
          },
        },
        ...(page ? pageQuery(page) : {}),
        include: QUERY_WITH_TAGS,
      })
      return articles.map((article) => mapArticle(article, article.tags))
    },
    async findMany(handle, query, page) {
      const articles = await handle.article.findMany({
        where: {
          ...(query.bySearchTerm && {
            title: {
              contains: query.bySearchTerm,
              mode: "insensitive",
            },
          }),
          ...(query.byTags &&
            query.byTags.length > 0 && {
              tags: {
                some: {
                  tagName: {
                    in: query.byTags,
                  },
                },
              },
            }),
        },
        include: QUERY_WITH_TAGS,
        ...pageQuery(page),
      })

      return articles.map((article) => mapArticle(article, article.tags))
    },
    async getFeatured(handle) {
      const articles = await handle.article.findMany({
        where: {
          isFeatured: true,
        },
        include: QUERY_WITH_TAGS,
      })
      return articles.map((article) => mapArticle(article, article.tags))
    },
    async getMostUsedTags(handle, take) {
      const tags = await handle.articleTagLink.groupBy({
        by: "tagName",
        _count: {
          tagName: true,
        },
        orderBy: {
          _count: {
            tagName: "desc",
          },
        },
        take: take,
      })

      return tags.map((tag) =>
        parseOrReport(ArticleTagSchema, {
          name: tag.tagName,
        })
      )
    },
  }
}

function mapArticle(article: Omit<Article, "tags">, tags: { tag: ArticleTag }[]): Article {
  return parseOrReport(ArticleSchema, {
    ...article,
    tags: tags.map((link) => link.tag),
  })
}

const QUERY_WITH_TAGS = {
  tags: { include: { tag: true } },
} as const
