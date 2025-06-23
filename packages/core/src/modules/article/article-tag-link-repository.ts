import type { DBClient } from "@dotkomonline/db"
import type { ArticleId, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagLinkRepository {
  add(articleId: ArticleId, tagName: ArticleTagName): Promise<void>
  remove(articleId: ArticleId, tagName: ArticleTagName): Promise<void>
}

export class ArticleTagLinkRepositoryImpl implements ArticleTagLinkRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async add(articleId: ArticleId, tagName: ArticleTagName): Promise<void> {
    await this.db.articleTagLink.create({ data: { articleId, tagName } })
  }

  public async remove(articleId: ArticleId, tagName: ArticleTagName): Promise<void> {
    await this.db.articleTagLink.delete({ where: { articleId_tagName: { articleId, tagName } } })
  }
}
