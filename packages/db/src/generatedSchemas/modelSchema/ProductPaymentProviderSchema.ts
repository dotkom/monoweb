import { z } from 'zod';
import { PaymentProviderSchema } from '../inputTypeSchemas/PaymentProviderSchema'

/////////////////////////////////////////
// PRODUCT PAYMENT PROVIDER SCHEMA
/////////////////////////////////////////

export const ProductPaymentProviderSchema = z.object({
  paymentProvider: PaymentProviderSchema,
  productId: z.string(),
  paymentProviderId: z.string(),
})

export type ProductPaymentProvider = z.infer<typeof ProductPaymentProviderSchema>

export default ProductPaymentProviderSchema;
