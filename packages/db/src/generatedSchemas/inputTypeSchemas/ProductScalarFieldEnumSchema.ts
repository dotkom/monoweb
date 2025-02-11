import { z } from 'zod';

export const ProductScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','type','objectId','amount','deletedAt','isRefundable','refundRequiresApproval']);

export default ProductScalarFieldEnumSchema;
