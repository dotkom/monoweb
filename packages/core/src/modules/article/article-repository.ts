import type { DBClient } from "@dotkomonline/db"
import type { Article, ArticleId, ArticleSlug, ArticleTagName, ArticleWrite } from "@dotkomonline/types"

export interface ArticleRepository {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(take: number, offset?: number): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  getByTags(tags: ArticleTagName[], take: number, offset?: number): Promise<Article[]>
}

export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private readonly db: DBClient) {}

  async create(input: ArticleWrite): Promise<Article> {
    return await this.db.article.create({ data: input })
  }

  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    return await this.db.article.update({ where: { id }, data: input })
  }

  async getAll(take: number, offset?: number): Promise<Article[]> {
    return await this.db.article.findMany({ take, skip: offset })
  }

  async getById(id: ArticleId): Promise<Article | null> {
    return await this.db.article.findUnique({ where: { id } })
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    return await this.db.article.findUnique({ where: { slug } })
  }

  async getByTags(tags: ArticleTagName[], take: number, offset?: number): Promise<Article[]> {
    return await this.db.article.findMany({
      take,
      skip: offset,
      where: {
        tags: {
          some: {
            tagName: {
              in: tags,
            },
          },
        },
      },
    })
  }
}
