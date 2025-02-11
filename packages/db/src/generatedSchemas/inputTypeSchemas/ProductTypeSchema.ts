import { z } from 'zod';

export const ProductTypeSchema = z.enum(['EVENT']);

export type ProductTypeType = `${z.infer<typeof ProductTypeSchema>}`

export default ProductTypeSchema;
