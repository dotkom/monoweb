import { z } from 'zod';

/////////////////////////////////////////
// ARTICLE SCHEMA
/////////////////////////////////////////

export const ArticleSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  author: z.string(),
  photographer: z.string(),
  imageUrl: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(),
})

export type Article = z.infer<typeof ArticleSchema>

export default ArticleSchema;
