import { z } from "zod";

export const ProductPaymentProviderSchema = z.object({
  paymentProvider: z.enum(["STRIPE"]), // include VIPPS later
  paymentProviderId: z.string(), // Stripe = public_key | Vipps = client_id
  productId: z.string().uuid(),
});

export type ProductPaymentProvider = z.infer<typeof ProductPaymentProviderSchema>;

export const PaymentProviderSchema = ProductPaymentProviderSchema.omit({
  productId: true,
});

export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;

export const ProductPaymentProviderWriteSchema = ProductPaymentProviderSchema;

export type ProductPaymentProviderWrite = z.infer<typeof ProductPaymentProviderWriteSchema>;

export const ProductSchema = z.object({
  amount: z.number(), // price
  createdAt: z.date(),
  deletedAt: z.date().nullable(), // null = not deleted
  id: z.string().uuid(),
  isRefundable: z.boolean(),
  objectId: z.string().uuid().nullable(), // The OW object this product is linked to e.g. eventId, webshopItemId. null if not linked
  paymentProviders: z.array(PaymentProviderSchema),
  refundRequiresApproval: z.boolean(), // typically by bankkom
  type: z.enum(["EVENT"]), // inlude WEBSHOP later
  updatedAt: z.date(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductWriteSchema = ProductSchema.omit({
  createdAt: true,
  deletedAt: true,
  id: true,
  paymentProviders: true,
  updatedAt: true,
});

export type ProductWrite = z.infer<typeof ProductWriteSchema>;

export const PaymentSchema = z.object({
  createdAt: z.date(),
  id: z.string().uuid(),
  paymentProviderId: z.string(), // Stripe = payment_intent_id | Vipps = order_id
  paymentProviderOrderId: z.string().nullable(), // Stripe = payment intent id
  paymentProviderSessionId: z.string(), // Stripe = checkout session id
  productId: z.string().uuid(),
  status: z.enum(["UNPAID", "PAID", "REFUNDED"]),
  updatedAt: z.date(),
  userId: z.string(),
});

export type Payment = z.infer<typeof PaymentSchema>;

export const PaymentWriteSchema = PaymentSchema.partial({
  paymentProviderOrderId: true,
}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type PaymentWrite = z.infer<typeof PaymentWriteSchema>;

export const RefundRequestSchema = z.object({
  createdAt: z.date(),
  handledBy: z.string().nullable(), // user that either approved or rejected the request
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  reason: z.string().min(1).max(255),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  updatedAt: z.date(),
  userId: z.string(),
});

export type RefundRequest = z.infer<typeof RefundRequestSchema>;

export const RefundRequestWriteSchema = RefundRequestSchema.omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type RefundRequestWrite = z.infer<typeof RefundRequestWriteSchema>;
