import type { DBHandle } from "@dotkomonline/db"
import type { ArticleId, ArticleTag, ArticleTagName } from "@dotkomonline/types"

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
      return await handle.articleTag.findMany()
    },
    async create(handle, tagName) {
      return await handle.articleTag.create({
        data: { name: tagName },
      })
    },
    async delete(handle, tagName) {
      return await handle.articleTag.delete({ where: { name: tagName } })
    },
    async getByName(handle, tagName) {
      return await handle.articleTag.findUnique({ where: { name: tagName } })
    },
    async getAllByArticle(handle, articleId) {
      return await handle.articleTag.findMany({
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
    },
  }
}
