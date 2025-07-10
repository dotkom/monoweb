import type { DBHandle } from "@dotkomonline/db"
import type { ArticleId, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagLinkRepository {
  add(handle: DBHandle, articleId: ArticleId, tagName: ArticleTagName): Promise<void>
  remove(handle: DBHandle, articleId: ArticleId, tagName: ArticleTagName): Promise<void>
}

export function getArticleTagLinkRepository(): ArticleTagLinkRepository {
  return {
    async add(handle, articleId, tagName) {
      await handle.articleTagLink.create({ data: { articleId, tagName } })
    },
    async remove(handle, articleId, tagName) {
      await handle.articleTagLink.delete({ where: { articleId_tagName: { articleId, tagName } } })
    },
  }
}
