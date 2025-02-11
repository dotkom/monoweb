import { z } from 'zod';

export const PaymentStatusSchema = z.enum(['UNPAID','PAID','REFUNDED']);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`

export default PaymentStatusSchema;
