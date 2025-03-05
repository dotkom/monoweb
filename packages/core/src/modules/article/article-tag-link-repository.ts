import type { DBClient } from "@dotkomonline/db"
import type { ArticleId, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagLinkRepository {
  add(article: ArticleId, tag: ArticleTagName): Promise<void>
  remove(article: ArticleId, tag: ArticleTagName): Promise<void>
}

export class ArticleTagLinkRepositoryImpl implements ArticleTagLinkRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async add(articleId: ArticleId, tagName: ArticleTagName): Promise<void> {
    await this.db.articleTagLink.create({ data: { articleId, tagName } })
  }

  async remove(articleId: ArticleId, tagName: ArticleTagName): Promise<void> {
    await this.db.articleTagLink.delete({ where: { articleId_tagName: { articleId, tagName } } })
  }
}
