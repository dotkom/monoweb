import type { DBHandle } from "@dotkomonline/db"
import type { ArticleId, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagLinkRepository {
  add(handle: DBHandle, articleId: ArticleId, articleTagName: ArticleTagName): Promise<void>
  remove(handle: DBHandle, articleId: ArticleId, articleTagName: ArticleTagName): Promise<void>
}

export function getArticleTagLinkRepository(): ArticleTagLinkRepository {
  return {
    async add(handle, articleId, articleTagName) {
      await handle.articleTagLink.create({
        data: {
          articleId,
          tagName: articleTagName,
        },
      })
    },

    async remove(handle, articleId, articleTagName) {
      await handle.articleTagLink.delete({
        where: {
          articleId_tagName: { articleId, tagName: articleTagName },
        },
      })
    },
  }
}
