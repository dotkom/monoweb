import type { DBHandle } from "@dotkomonline/db"
import { type ArticleId, type ArticleTag, type ArticleTagName, ArticleTagSchema } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface ArticleTagRepository {
  getAll(handle: DBHandle): Promise<ArticleTag[]>
  create(handle: DBHandle, tagName: ArticleTagName): Promise<ArticleTag>
  delete(handle: DBHandle, tagName: ArticleTagName): Promise<ArticleTag>
  getByName(handle: DBHandle, tagName: ArticleTagName): Promise<ArticleTag | null>
  getAllByArticle(handle: DBHandle, articleId: ArticleId): Promise<ArticleTag[]>
}

export function getArticleTagRepository(): ArticleTagRepository {
  return {
    async getAll(handle) {
      const tags = await handle.articleTag.findMany()
      return tags.map((tag) => parseOrReport(ArticleTagSchema, tag))
    },
    async create(handle, tagName) {
      const tag = await handle.articleTag.create({
        data: { name: tagName },
      })
      return parseOrReport(ArticleTagSchema, tag)
    },
    async delete(handle, tagName) {
      const tag = await handle.articleTag.delete({ where: { name: tagName } })
      return parseOrReport(ArticleTagSchema, tag)
    },
    async getByName(handle, tagName) {
      const tag = await handle.articleTag.findUnique({ where: { name: tagName } })
      return tag ? parseOrReport(ArticleTagSchema, tag) : null
    },
    async getAllByArticle(handle, articleId) {
      const tags = await handle.articleTag.findMany({
        where: {
          articles: {
            some: {
              articleId: {
                equals: articleId,
              },
            },
          },
        },
      })
      return tags.map((tag) => parseOrReport(ArticleTagSchema, tag))
    },
  }
}
