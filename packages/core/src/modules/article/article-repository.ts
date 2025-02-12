import type { DBClient } from "@dotkomonline/db"
import type { Article, ArticleId, ArticleSlug, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { Pageable, pageQuery } from "../../query"

export interface ArticleRepository {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(page: Pageable): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  getByTags(tags: ArticleTagName[], page?: Pageable): Promise<Article[]>
}

export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private readonly db: DBClient) {}

  async create(input: ArticleWrite): Promise<Article> {
    return await this.db.article.create({ data: input })
  }

  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    return await this.db.article.update({ where: { id }, data: input })
  }

  async getAll(page: Pageable): Promise<Article[]> {
    return await this.db.article.findMany({ ...pageQuery(page)  })
  }

  async getById(id: ArticleId): Promise<Article | null> {
    return await this.db.article.findUnique({ where: { id } })
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    return await this.db.article.findUnique({ where: { slug } })
  }

  async getByTags(tags: ArticleTagName[], page: Pageable): Promise<Article[]> {
    return await this.db.article.findMany({
      where: {
        tags: {
          some: {
            tagName: {
              in: tags,
            },
          },
        },
      },
      ...pageQuery(page),
    })
  }
}
