import type { DBHandle } from "@dotkomonline/db"
import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface ArticleRepository {
  create(handle: DBHandle, input: ArticleWrite): Promise<Article>
  update(handle: DBHandle, articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(handle: DBHandle, page: Pageable): Promise<Article[]>
  getById(handle: DBHandle, articleId: ArticleId): Promise<Article | null>
  getBySlug(handle: DBHandle, slug: ArticleSlug): Promise<Article | null>
  getByTags(handle: DBHandle, tags: ArticleTagName[], page?: Pageable): Promise<Article[]>
  getFeatured(handle: DBHandle): Promise<Article[]>
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
    async getFeatured(handle) {
      const articles = await handle.article.findMany({
        where: {
          isFeatured: true,
        },
        include: QUERY_WITH_TAGS,
      })
      return articles.map((article) => mapArticle(article, article.tags))
    },
  }
}

function mapArticle(article: Omit<Article, "tags">, tags: { tag: ArticleTag }[]): Article {
  return {
    ...article,
    tags: tags.map((link) => link.tag),
  }
}

const QUERY_WITH_TAGS = {
  tags: { include: { tag: true } },
} as const
