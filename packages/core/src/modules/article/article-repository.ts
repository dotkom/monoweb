import type { DBClient } from "@dotkomonline/db"
import type { Article, ArticleId, ArticleSlug, ArticleTag, ArticleTagName, ArticleWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface ArticleRepository {
  create(input: ArticleWrite): Promise<Article>
  update(articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(page: Pageable): Promise<Article[]>
  getById(articleId: ArticleId): Promise<Article | null>
  getBySlug(slug: ArticleSlug): Promise<Article | null>
  getByTags(tags: ArticleTagName[], page?: Pageable): Promise<Article[]>
  getFeatured(): Promise<Article[]>
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

  public async create(input: ArticleWrite): Promise<Article> {
    const article = await this.db.article.create({ data: input, include: this.includeTags })
    return this.mapArticle(article)
  }

  public async update(articleId: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const article = await this.db.article.update({ where: { id: articleId }, data: input, include: this.includeTags })
    return this.mapArticle(article)
  }

  public async getAll(page: Pageable): Promise<Article[]> {
    const articles = await this.db.article.findMany({
      include: this.includeTags,
      ...pageQuery(page),
    })

    return articles.map(this.mapArticle)
  }

  public async getById(articleId: ArticleId): Promise<Article | null> {
    const article = await this.db.article.findUnique({ where: { id: articleId }, include: this.includeTags })
    return article ? this.mapArticle(article) : null
  }

  public async getBySlug(slug: ArticleSlug): Promise<Article | null> {
    const article = await this.db.article.findUnique({ where: { slug }, include: this.includeTags })
    return article ? this.mapArticle(article) : null
  }

  public async getByTags(tags: ArticleTagName[], page?: Pageable): Promise<Article[]> {
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
      ...(page ? pageQuery(page) : {}),
      include: this.includeTags,
    })

    return articles.map(this.mapArticle)
  }

  public async getFeatured(): Promise<Article[]> {
    const articles = await this.db.article.findMany({
      where: {
        isFeatured: true,
      },
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
