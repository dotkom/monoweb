import { z } from "zod"
import { buildAnyOfFilter, buildSearchFilter } from "./filters"

/** Branded type for ArticleTag names */
export const ArticleTagNameSchema = z.string().brand<"ArticleTag">()
export type ArticleTagName = z.infer<typeof ArticleTagNameSchema>

/**
 * Articles may be tagged with tags to indicate which topics the article is about.
 */
export const ArticleTagSchema = z.object({
  name: ArticleTagNameSchema,
})
export type ArticleTag = z.infer<typeof ArticleTagSchema>

export const ArticleTagWrite = ArticleTagSchema.pick({ name: true })
export type ArticleTagWrite = z.infer<typeof ArticleTagWrite>

/** Branded type for Article IDs */
export const ArticleIdSchema = z.string().uuid().brand<"Article">()
export type ArticleId = z.infer<typeof ArticleIdSchema>

/**
 * An article is a blog article written by an author, published on the website.
 */
export const ArticleSchema = z.object({
  id: ArticleIdSchema,
  title: z.string(),
  author: z.string(),
  photographer: z.string(),
  imageUrl: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
  isFeatured: z.boolean(),
  vimeoId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  tags: z.array(ArticleTagSchema),
})
export type Article = z.infer<typeof ArticleSchema>
export type ArticleSlug = Article["slug"]

export const ArticleWriteSchema = ArticleSchema.pick({
  title: true,
  author: true,
  photographer: true,
  imageUrl: true,
  slug: true,
  excerpt: true,
  content: true,
  isFeatured: true,
  vimeoId: true,
})
export type ArticleWrite = z.infer<typeof ArticleWriteSchema>

/** Filtering Query available for articles */
export const ArticleFilterQuerySchema = z
  .object({
    bySearchTerm: buildSearchFilter(),
    byTags: buildAnyOfFilter(ArticleTagSchema.shape.name),
  })
  .partial()
export type ArticleFilterQuery = z.infer<typeof ArticleFilterQuerySchema>
