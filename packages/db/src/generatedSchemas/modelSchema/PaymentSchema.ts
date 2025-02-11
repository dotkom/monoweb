import { z } from 'zod';
import { PaymentStatusSchema } from '../inputTypeSchemas/PaymentStatusSchema'

/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////

export const PaymentSchema = z.object({
  status: PaymentStatusSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  productId: z.string(),
  userId: z.string(),
  paymentProviderId: z.string(),
  paymentProviderSessionId: z.string(),
  paymentProviderOrderId: z.string().nullable(),
})

export type Payment = z.infer<typeof PaymentSchema>

export default PaymentSchema;
