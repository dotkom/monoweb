import { z } from 'zod';

/////////////////////////////////////////
// ARTICLE TAG SCHEMA
/////////////////////////////////////////

export const ArticleTagSchema = z.object({
  name: z.string(),
})

export type ArticleTag = z.infer<typeof ArticleTagSchema>

export default ArticleTagSchema;
