import type { DBClient } from "@dotkomonline/db"
import type { ArticleTag, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagRepository {
  getAll(): Promise<ArticleTag[]>
  create(name: ArticleTagName): Promise<ArticleTag>
  delete(name: ArticleTagName): Promise<ArticleTag>
  getByName(name: ArticleTagName): Promise<ArticleTag | null>
}

export class ArticleTagRepositoryImpl implements ArticleTagRepository {
  constructor(private readonly db: DBClient) {}

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
