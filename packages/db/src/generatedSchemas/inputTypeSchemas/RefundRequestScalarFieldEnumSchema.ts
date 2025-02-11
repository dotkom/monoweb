import { z } from 'zod';

export const RefundRequestScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','paymentId','userId','reason','status','handledById']);

export default RefundRequestScalarFieldEnumSchema;
