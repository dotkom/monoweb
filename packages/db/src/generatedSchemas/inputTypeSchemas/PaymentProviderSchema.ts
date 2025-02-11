import { z } from 'zod';

export const PaymentProviderSchema = z.enum(['STRIPE']);

export type PaymentProviderType = `${z.infer<typeof PaymentProviderSchema>}`

export default PaymentProviderSchema;
