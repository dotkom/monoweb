import { z } from 'zod';

export const ArticleScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','title','author','photographer','imageUrl','slug','excerpt','content']);

export default ArticleScalarFieldEnumSchema;
