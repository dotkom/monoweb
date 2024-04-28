import type { Database } from "@dotkomonline/db"
import { type ArticleTag, type ArticleTagName, ArticleTagSchema } from "@dotkomonline/types"
import type { Kysely, Selectable } from "kysely"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

export const mapToArticleTag = (payload: Selectable<Database["articleTags"]>) => ArticleTagSchema.parse(payload)

export interface ArticleTagRepository {
  getAll(take: number, cursor?: Cursor): Promise<ArticleTag[]>
  create(name: ArticleTagName): Promise<ArticleTag>
  delete(name: ArticleTagName): Promise<ArticleTag>
  getByName(name: ArticleTagName): Promise<ArticleTag | undefined>
}

export class ArticleTagRepositoryImpl implements ArticleTagRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getAll(take: number, cursor?: Cursor): Promise<ArticleTag[]> {
    const query = orderedQuery(this.db.selectFrom("articleTags").selectAll().limit(take), cursor)
    const tags = await query.execute()
    return tags.map(mapToArticleTag)
  }

  async create(name: ArticleTagName): Promise<ArticleTag> {
    const tag = await this.db.insertInto("articleTags").values({ name }).returningAll().executeTakeFirstOrThrow()
    return mapToArticleTag(tag)
  }

  async delete(name: ArticleTagName): Promise<ArticleTag> {
    const tag = await this.db
      .deleteFrom("articleTags")
      .where("name", "=", name)
      .returningAll()
      .executeTakeFirstOrThrow()
    return mapToArticleTag(tag)
  }

  async getByName(name: ArticleTagName): Promise<ArticleTag | undefined> {
    const tag = await this.db.selectFrom("articleTags").selectAll().where("name", "=", name).executeTakeFirst()
    return tag ? mapToArticleTag(tag) : undefined
  }
}
