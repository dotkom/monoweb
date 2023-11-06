import { type Kysely, type Selectable } from "kysely"
import { type Database } from "@dotkomonline/db"
import {
  type Article,
  type ArticleId,
  ArticleSchema,
  type ArticleSlug,
  type ArticleTagName,
  type ArticleWrite,
} from "@dotkomonline/types"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToArticle = (payload: Selectable<Database["articles"]>) => ArticleSchema.parse(payload)

export interface ArticleRepository {
  create(input: ArticleWrite): Promise<Article>
  update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article>
  getAll(take: number, cursor?: Cursor): Promise<Article[]>
  getById(id: ArticleId): Promise<Article | undefined>
  getBySlug(slug: ArticleSlug): Promise<Article | undefined>
  getByTags(tags: ArticleTagName[], take: number, cursor?: Cursor): Promise<Article[]>
}

export class ArticleRepositoryImpl implements ArticleRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(input: ArticleWrite): Promise<Article> {
    const article = await this.db
      .insertInto("articles")
      .values({ ...input })
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToArticle(article)
  }

  async update(id: ArticleId, input: Partial<ArticleWrite>): Promise<Article> {
    const article = await this.db
      .updateTable("articles")
      .set({ ...input, updatedAt: new Date() })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToArticle(article)
  }

  async getAll(take: number, cursor?: Cursor): Promise<Article[]> {
    const query = orderedQuery(this.db.selectFrom("articles").selectAll().limit(take), cursor)
    const articles = await query.execute()
    return articles.map(mapToArticle)
  }

  async getById(id: ArticleId): Promise<Article | undefined> {
    const article = await this.db.selectFrom("articles").selectAll().where("id", "=", id).executeTakeFirst()
    return article ? mapToArticle(article) : undefined
  }

  async getBySlug(slug: ArticleSlug): Promise<Article | undefined> {
    const article = await this.db.selectFrom("articles").selectAll().where("slug", "=", slug).executeTakeFirst()
    return article ? mapToArticle(article) : undefined
  }

  async getByTags(tags: ArticleTagName[], take: number, cursor?: Cursor): Promise<Article[]> {
    const query = orderedQuery(
      this.db
        .selectFrom("articles")
        .distinct()
        .innerJoin("articleTagLink", "articles.id", "articleTagLink.article")
        .select([
          "articles.id",
          "articles.createdAt",
          "articles.updatedAt",
          "articles.title",
          "articles.author",
          "articles.photographer",
          "articles.imageUrl",
          "articles.slug",
          "articles.excerpt",
          "articles.content",
        ])
        .where("articleTagLink.tag", "in", tags)
        .limit(take),
      cursor
    )
    const articles = await query.execute()
    return articles.map(mapToArticle)
  }
}
