import z from "zod"

/**
 * Articles may be tagged with one or more tags. Tags themselves only have a name, but are linked through a database
 * link table.
 *
 * @see {ArticleTagLink}
 */
export type ArticleTag = z.infer<typeof ArticleTag>
export type ArticleTagName = ArticleTag["name"]
export type ArticleTagWrite = z.infer<typeof ArticleTagWrite>

export const ArticleTag = z.object({
  name: z.string(),
})

export const ArticleTagWrite = ArticleTag.pick({ name: true })

/**
 * Domain type for Article
 *
 * An article is a blog post written by an OnlineWeb member, typically (but not limited to) somebody from Prokom. Its
 * contents are stored as rich text content to be rendered by the client.
 */
export type Article = z.infer<typeof Article>
export type ArticleId = Article["id"]
export type ArticleSlug = Article["slug"]
export type ArticleWrite = z.infer<typeof ArticleWrite>

export const Article = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  /**
   * The stylized name of the author of the post.
   *
   * TODO: This should likely be a foreign key to the users table.
   */
  author: z.string(),
  /**
   * The stylized name of the photographer or artist of the cover image for the article.
   *
   * This is intended to be left as a string, as the photographer may be somebody who is not related to Online at all.
   */
  photographer: z.string(),
  imageUrl: z.string().url(),
  excerpt: z.string(),
  content: z.string(),
  isFeatured: z.boolean(),
  vimeoId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(ArticleTag),
})

export const ArticleWrite = Article.pick({
  slug: true,
  title: true,
  author: true,
  photographer: true,
  imageUrl: true,
  excerpt: true,
  content: true,
  isFeatured: true,
  vimeoId: true,
})
