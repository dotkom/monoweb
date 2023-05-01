import { Generated } from "kysely"

type PaymentProvider = "STRIPE" | "VIPPS"
type ProductType = "EVENT" // inlude WEBSHOP later
type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED"

export interface ProductTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  type: ProductType
  objectId: string | null
  amount: number
  deletedAt: Date | null
}

export interface PaymentTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  productId: string
  userId: string
  paymentProviderId: string
  paymentProviderOrderId: string
  status: PaymentStatus
}

export interface ProductPaymentProviderTable {
  productId: string
  paymentProvider: PaymentProvider
  paymentProviderId: string // client_id or public_key
}
