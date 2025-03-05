import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const ArticleTagSchema = schemas.ArticleTagSchema.extend({})

export type ArticleTagName = ArticleTag["name"]
export type ArticleTag = z.infer<typeof ArticleTagSchema>

export const ArticleTagWrite = ArticleTagSchema
export type ArticleTagWrite = z.infer<typeof ArticleTagWrite>

export const ArticleSchema = schemas.ArticleSchema.extend({})

export type ArticleSlug = Article["slug"]
export type ArticleId = Article["id"]
export type Article = z.infer<typeof ArticleSchema>

export const ArticleWriteSchema = ArticleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type ArticleWrite = z.infer<typeof ArticleWriteSchema>
