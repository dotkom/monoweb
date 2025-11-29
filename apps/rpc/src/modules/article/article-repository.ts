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
  create(handle: DBHandle, data: ArticleWrite): Promise<Article>
  update(handle: DBHandle, articleId: ArticleId, data: Partial<ArticleWrite>): Promise<Article>
  findById(handle: DBHandle, articleId: ArticleId): Promise<Article | null>
  findBySlug(handle: DBHandle, articleSlug: ArticleSlug): Promise<Article | null>
  findMany(handle: DBHandle, query: ArticleFilterQuery, page: Pageable): Promise<Article[]>
  findManyByTags(handle: DBHandle, articleTags: ArticleTagName[], page?: Pageable): Promise<Article[]>
  findFeatured(handle: DBHandle): Promise<Article[]>
  findTagsOrderedByPopularity(handle: DBHandle, take: number): Promise<ArticleTag[]>
}

export function getArticleRepository(): ArticleRepository {
  return {
    async create(handle, data) {
      const { tags, ...article } = await handle.article.create({ data, include: QUERY_WITH_TAGS })
      return mapArticle(article, tags)
    },

    async update(handle, articleId, data) {
      const { tags, ...article } = await handle.article.update({
        where: { id: articleId },
        data,
        include: QUERY_WITH_TAGS,
      })
      return mapArticle(article, tags)
    },

    async findById(handle, articleId) {
      const article = await handle.article.findUnique({ where: { id: articleId }, include: QUERY_WITH_TAGS })
      return article ? mapArticle(article, article.tags) : null
    },

    async findBySlug(handle, articleSlug) {
      const article = await handle.article.findUnique({ where: { slug: articleSlug }, include: QUERY_WITH_TAGS })
      return article ? mapArticle(article, article.tags) : null
    },

    async findManyByTags(handle, articleTags, page) {
      const articles = await handle.article.findMany({
        where: {
          tags: {
            some: {
              tagName: {
                in: articleTags,
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
        orderBy: {
          createdAt: "desc",
        },
      })

      return articles.map((article) => mapArticle(article, article.tags))
    },

    async findFeatured(handle) {
      const articles = await handle.article.findMany({
        where: {
          isFeatured: true,
        },
        include: QUERY_WITH_TAGS,
      })
      return articles.map((article) => mapArticle(article, article.tags))
    },

    async findTagsOrderedByPopularity(handle, take) {
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
