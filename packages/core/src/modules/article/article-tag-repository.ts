import type { DBClient } from "@dotkomonline/db"
import type { ArticleTag, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagRepository {
  getAll(): Promise<ArticleTag[]>
  create(name: ArticleTagName): Promise<ArticleTag>
  delete(name: ArticleTagName): Promise<ArticleTag>
  getByName(name: ArticleTagName): Promise<ArticleTag | null>
}

export class ArticleTagRepositoryImpl implements ArticleTagRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  async getAll(): Promise<ArticleTag[]> {
    return await this.db.articleTag.findMany()
  }

  async create(name: ArticleTagName): Promise<ArticleTag> {
    return await this.db.articleTag.create({
      data: { name },
    })
  }

  async delete(name: ArticleTagName): Promise<ArticleTag> {
    return await this.db.articleTag.delete({ where: { name } })
  }

  async getByName(name: ArticleTagName): Promise<ArticleTag | null> {
    return await this.db.articleTag.findUnique({ where: { name } })
  }
}
