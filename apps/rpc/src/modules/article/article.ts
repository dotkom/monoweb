import { buildAnyOfFilter, buildSearchFilter } from "@dotkomonline/utils"
import { z } from "zod"

export const ArticleTagSchema = z.object({
  name: z.string(),
})

export type ArticleTagName = ArticleTag["name"]
export type ArticleTag = z.infer<typeof ArticleTagSchema>

export const ArticleTagWrite = ArticleTagSchema
export type ArticleTagWrite = z.infer<typeof ArticleTagWrite>

export const ArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  photographer: z.string(),
  imageUrl: z.string(),
  excerpt: z.string(),
  content: z.string(),
  isFeatured: z.boolean(),
  vimeoId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  tags: z.array(ArticleTagSchema),
})

export type ArticleSlug = Article["slug"]
export type ArticleId = Article["id"]
export type Article = z.infer<typeof ArticleSchema>

export const ArticleWriteSchema = ArticleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tags: true,
})

export type ArticleWrite = z.infer<typeof ArticleWriteSchema>

export type ArticleFilterQuery = z.infer<typeof ArticleFilterQuerySchema>
export const ArticleFilterQuerySchema = z
  .object({
    bySearchTerm: buildSearchFilter(),
    byTags: buildAnyOfFilter(ArticleTagSchema.shape.name),
  })
  .partial()

export const ARTICLE_IMAGE_MAX_SIZE_KIB = 5 * 1024
