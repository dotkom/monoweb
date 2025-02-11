import { z } from 'zod';

/////////////////////////////////////////
// ARTICLE TAG LINK SCHEMA
/////////////////////////////////////////

export const ArticleTagLinkSchema = z.object({
  articleId: z.string(),
  tagName: z.string(),
})

export type ArticleTagLink = z.infer<typeof ArticleTagLinkSchema>

export default ArticleTagLinkSchema;
