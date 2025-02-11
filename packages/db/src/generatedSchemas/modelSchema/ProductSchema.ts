import { z } from 'zod';
import { ProductTypeSchema } from '../inputTypeSchemas/ProductTypeSchema'

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  type: ProductTypeSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  objectId: z.string().nullable(),
  amount: z.number().int(),
  deletedAt: z.coerce.date().nullable(),
  isRefundable: z.boolean(),
  refundRequiresApproval: z.boolean(),
})

export type Product = z.infer<typeof ProductSchema>

export default ProductSchema;
