import type { DBHandle } from "@dotkomonline/db"
import { type ArticleId, type ArticleTag, type ArticleTagName, ArticleTagSchema } from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface ArticleTagRepository {
  findByName(handle: DBHandle, articleTagName: ArticleTagName): Promise<ArticleTag | null>
  findMany(handle: DBHandle): Promise<ArticleTag[]>
  findManyByArticleId(handle: DBHandle, articleId: ArticleId): Promise<ArticleTag[]>
  create(handle: DBHandle, articleTagName: ArticleTagName): Promise<ArticleTag>
  delete(handle: DBHandle, articleTagName: ArticleTagName): Promise<ArticleTag>
}

export function getArticleTagRepository(): ArticleTagRepository {
  return {
    async findByName(handle, articleTagName) {
      const tag = await handle.articleTag.findUnique({
        where: {
          name: articleTagName,
        },
      })

      return parseOrReport(ArticleTagSchema.nullable(), tag)
    },

    async findMany(handle) {
      const tags = await handle.articleTag.findMany()
      return parseOrReport(ArticleTagSchema.array(), tags)
    },

    async create(handle, articleTagName) {
      const tag = await handle.articleTag.create({
        data: {
          name: articleTagName,
        },
      })

      return parseOrReport(ArticleTagSchema, tag)
    },

    async delete(handle, articleTagName) {
      const tag = await handle.articleTag.delete({
        where: {
          name: articleTagName,
        },
      })

      return parseOrReport(ArticleTagSchema, tag)
    },

    async findManyByArticleId(handle, articleId) {
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

      return parseOrReport(ArticleTagSchema.array(), tags)
    },
  }
}
