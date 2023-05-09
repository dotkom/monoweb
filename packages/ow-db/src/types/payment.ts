import { Generated } from "kysely"

type PaymentProvider = "STRIPE" // include VIPPS later
type ProductType = "EVENT" // inlude WEBSHOP later
type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED"

export interface ProductTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  type: ProductType
  objectId: string | null
  amount: number
  isRefundable: boolean
  refundRequiresApproval: boolean
  deletedAt: Date | null
}

export interface PaymentTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  productId: string
  userId: string
  paymentProviderId: string
  paymentProviderSessionId: string
  paymentProviderOrderId: string | null
  status: PaymentStatus
}

export interface ProductPaymentProviderTable {
  productId: string
  paymentProvider: PaymentProvider
  paymentProviderId: string // client_id or public_key
}

export interface RefundRequestTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  paymentId: string
  userId: string
  reason: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  handledBy: string | null
}
