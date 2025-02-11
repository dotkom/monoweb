import type { DBClient } from "@dotkomonline/db"
import type { ArticleTag, ArticleTagName } from "@dotkomonline/types"

export interface ArticleTagRepository {
  getAll(take: number, offset?: number): Promise<ArticleTag[]>
  create(name: ArticleTagName): Promise<ArticleTag>
  delete(name: ArticleTagName): Promise<ArticleTag>
  getByName(name: ArticleTagName): Promise<ArticleTag | null>
}

export class ArticleTagRepositoryImpl implements ArticleTagRepository {
  constructor(private readonly db: DBClient) {}

  async getAll(take: number, offset?: number): Promise<ArticleTag[]> {
    return await this.db.articleTag.findMany({
      take,
      skip: offset,
    })
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
