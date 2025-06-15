import type { DBClient } from "@dotkomonline/db"
import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface ArticleRepository {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(page: Pageable): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  getByTags(tags: ArticleTagName[], page?: Pageable): Promise<Article[]>
}

type ArticleWithTagLinks = Omit<Article, "tags"> & {
  tags: {
    tag: ArticleTag
  }[]
}

export class ArticleRepositoryImpl implements ArticleRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private includeTags = {
    tags: { include: { tag: true } },
  }

  async create(input: ArticleWrite): Promise<Article> {
    const article = await this.db.article.create({ data: input, include: this.includeTags })
    return this.mapArticle(article)
  }

  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const article = await this.db.article.update({ where: { id }, data: input, include: this.includeTags })
    return this.mapArticle(article)
  }

  async getAll(page: Pageable): Promise<Article[]> {
    const articles = await this.db.article.findMany({
      include: this.includeTags,
      ...pageQuery(page),
    })

    return articles.map(this.mapArticle)
  }

  async getById(id: ArticleId): Promise<Article | null> {
    const article = await this.db.article.findUnique({ where: { id }, include: this.includeTags })
    return article ? this.mapArticle(article) : null
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    const article = await this.db.article.findUnique({ where: { slug }, include: this.includeTags })
    return article ? this.mapArticle(article) : null
  }

  async getByTags(tags: ArticleTagName[], page: Pageable): Promise<Article[]> {
    const articles = await this.db.article.findMany({
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
      include: this.includeTags,
    })

    return articles.map(this.mapArticle)
  }

  private mapArticle(articleWithTagLinks: ArticleWithTagLinks): Article {
    const { tags, ...article } = articleWithTagLinks
    return {
      ...article,
      tags: tags.map((link) => link.tag.name),
    }
  }
}
