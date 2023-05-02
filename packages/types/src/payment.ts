import { z } from "zod"

export const ProductPaymentProviderSchema = z.object({
  productId: z.string().uuid(),
  paymentProvider: z.enum(["STRIPE"]), // include VIPPS later
  paymentProviderId: z.string(), // Stripe = public_key | Vipps = client_id
})

export type ProductPaymentProvider = z.infer<typeof ProductPaymentProviderSchema>

export const PaymentProviderSchema = ProductPaymentProviderSchema.omit({
  productId: true,
})

export type PaymentProvider = z.infer<typeof PaymentProviderSchema>

export const ProductPaymentProviderWriteSchema = ProductPaymentProviderSchema

export type ProductPaymentProviderWrite = z.infer<typeof ProductPaymentProviderWriteSchema>

export const ProductSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.enum(["EVENT"]), // inlude WEBSHOP later
  objectId: z.string().uuid().nullable(), // The OW object this product is linked to e.g. eventId, webshopItemId. null if not linked
  amount: z.number(), // price
  paymentProviders: z.array(PaymentProviderSchema),
  deletedAt: z.date().nullable(), // null = not deleted
})

export type Product = z.infer<typeof ProductSchema>

export const ProductWriteSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  paymentProviders: true,
})

export type ProductWrite = z.infer<typeof ProductWriteSchema>

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  productId: z.string().uuid(),
  userId: z.string(),
  paymentProviderId: z.string(), // Stripe = payment_intent_id | Vipps = order_id
  paymentProviderOrderId: z.string(),
  status: z.enum(["UNPAID", "PAID", "REFUNDED"]),
})

export type Transaction = z.infer<typeof TransactionSchema>

export const TransactionWriteSchema = TransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type TransactionWrite = z.infer<typeof TransactionWriteSchema>
