import { z } from "zod"

export const ArticleTagSchema = z.object({
  name: z.string().min(1),
})

export type ArticleTagName = ArticleTag["name"]
export type ArticleTag = z.infer<typeof ArticleTagSchema>

export const ArticleTagWrite = ArticleTagSchema
export type ArticleTagWrite = z.infer<typeof ArticleTagWrite>

export const ArticleSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().min(1),
  author: z.string().min(1),
  photographer: z.string().min(1),
  imageUrl: z.string().url(),
  slug: z.string().min(1),
  excerpt: z.string(),
  content: z.string(),
})

export type ArticleSlug = Article["slug"]
export type ArticleId = Article["id"]
export type Article = z.infer<typeof ArticleSchema>

export const ArticleWriteSchema = ArticleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type ArticleWrite = z.infer<typeof ArticleWriteSchema>
