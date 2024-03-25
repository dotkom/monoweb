import { z } from "zod"

export type Article = z.infer<typeof ArticleSchema>
export type ArticleId = Article["Id"]
export const ArticleSchema = z.object({
  Id: z.string().uuid(),
  ParentId: z.string().uuid().or(z.literal("<root>")),
  Slug: z.string().min(1),
  Title: z.string().min(1),
})
export type ArticleWrite = z.infer<typeof ArticleWriteSchema>
export const ArticleWriteSchema = ArticleSchema.omit({ Id: true })
