import { z } from 'zod';
import { RefundRequestStatusSchema } from '../inputTypeSchemas/RefundRequestStatusSchema'

/////////////////////////////////////////
// REFUND REQUEST SCHEMA
/////////////////////////////////////////

export const RefundRequestSchema = z.object({
  status: RefundRequestStatusSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  paymentId: z.string(),
  userId: z.string(),
  reason: z.string(),
  handledById: z.string().nullable(),
})

export type RefundRequest = z.infer<typeof RefundRequestSchema>

export default RefundRequestSchema;
