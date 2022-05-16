import { z } from "zod"
import { Article as SanityArticle } from "./repository-types/get-article"

const articleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  excerpt: z.string(),
  coverImage: z.string(),
  estimatedReadingTime: z.number(),
  photographer: z.string(),
})

export type Article = z.infer<typeof articleSchema>
export type InsertArticle = Omit<Article, "id">

export const mapToArticle = (payload: SanityArticle): Article => {
  const article: Article = {
    ...payload,
    createdAt: payload._createdAt,
    updatedAt: payload._updatedAt,
    coverImage: payload.cover_image.asset.url,
  }
  return articleSchema.parse(article)
}
