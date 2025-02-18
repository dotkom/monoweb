import { schemas } from "@dotkomonline/db"
import { z } from "zod"

export const ProductPaymentProviderSchema = schemas.ProductPaymentProviderSchema.extend({})

export type ProductPaymentProvider = z.infer<typeof ProductPaymentProviderSchema>

export const PaymentProviderSchema = ProductPaymentProviderSchema.omit({
  productId: true,
})

export type PaymentProvider = z.infer<typeof PaymentProviderSchema>

export const ProductPaymentProviderWriteSchema = ProductPaymentProviderSchema

export type ProductPaymentProviderWrite = z.infer<typeof ProductPaymentProviderWriteSchema>

export const ProductSchema = schemas.ProductSchema.extend({
  paymentProviders: z.array(PaymentProviderSchema),
})

export type ProductId = Product["id"]
export type Product = z.infer<typeof ProductSchema>

export const ProductWriteSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  paymentProviders: true,
})

export type ProductWrite = z.infer<typeof ProductWriteSchema>

export const PaymentSchema = schemas.PaymentSchema.extend({})

export type PaymentId = Payment["id"]
export type Payment = z.infer<typeof PaymentSchema>

export const PaymentWriteSchema = PaymentSchema.partial({
  paymentProviderOrderId: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type PaymentWrite = z.infer<typeof PaymentWriteSchema>

export const RefundRequestSchema = schemas.RefundRequestSchema.extend({})

export type RefundRequestId = RefundRequest["id"]
export type RefundRequest = z.infer<typeof RefundRequestSchema>

export const RefundRequestWriteSchema = RefundRequestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type RefundRequestWrite = z.infer<typeof RefundRequestWriteSchema>
