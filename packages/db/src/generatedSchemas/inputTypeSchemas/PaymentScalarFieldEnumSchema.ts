import { z } from 'zod';

export const PaymentScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','productId','userId','paymentProviderId','paymentProviderSessionId','paymentProviderOrderId','status']);

export default PaymentScalarFieldEnumSchema;
