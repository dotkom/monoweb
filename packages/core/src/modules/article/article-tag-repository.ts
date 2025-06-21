import type { DBClient } from "@dotkomonline/db"
import type { ArticleId, ArticleTag, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagRepository {
  getAll(): Promise<ArticleTag[]>
  create(tagName: ArticleTagName): Promise<ArticleTag>
  delete(tagName: ArticleTagName): Promise<ArticleTag>
  getByName(tagName: ArticleTagName): Promise<ArticleTag | null>
  getAllByArticle(articleId: ArticleId): Promise<ArticleTag[]>
}

export class ArticleTagRepositoryImpl implements ArticleTagRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async getAll(): Promise<ArticleTag[]> {
    return await this.db.articleTag.findMany()
  }

  public async create(tagName: ArticleTagName): Promise<ArticleTag> {
    return await this.db.articleTag.create({
      data: { name: tagName },
    })
  }

  public async delete(tagName: ArticleTagName): Promise<ArticleTag> {
    return await this.db.articleTag.delete({ where: { name: tagName } })
  }

  public async getByName(tagName: ArticleTagName): Promise<ArticleTag | null> {
    return await this.db.articleTag.findUnique({ where: { name: tagName } })
  }

  public async getAllByArticle(articleId: ArticleId): Promise<ArticleTag[]> {
    return await this.db.articleTag.findMany({
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
  }
}
