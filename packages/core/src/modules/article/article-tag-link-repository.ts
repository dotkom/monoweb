import { type ArticleId, type ArticleTagName } from "@dotkomonline/types"
import { type Kysely } from "kysely"
import { type Database } from "@dotkomonline/db"

export interface ArticleTagLinkRepository {
  add(article: ArticleId, tag: ArticleTagName): Promise<void>
  remove(article: ArticleId, tag: ArticleTagName): Promise<void>
}

export class ArticleTagLinkRepositoryImpl implements ArticleTagLinkRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async add(article: ArticleId, tag: ArticleTagName): Promise<void> {
    await this.db
      .insertInto("articleTagLink")
      .values({ tag, article })
      .onConflict((eb) => eb.doNothing())
      .execute()
  }

  async remove(article: ArticleId, tag: ArticleTagName): Promise<void> {
    await this.db
      .deleteFrom("articleTagLink")
      .where((eb) => eb.and([eb("tag", "=", tag), eb("article", "=", article)]))
      .execute()
  }
}
