import type { DBHandle } from "@dotkomonline/db"
import {
  type PaymentProvider,
  PaymentProviderSchema,
  type ProductId,
  type ProductPaymentProvider,
  ProductPaymentProviderSchema,
  type ProductPaymentProviderWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface ProductPaymentProviderRepository {
  create(handle: DBHandle, data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null>
  delete(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<void>
  getAllByProductId(handle: DBHandle, productId: ProductId): Promise<PaymentProvider[]>
  productHasPaymentProviderId(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<boolean>
}

export function getProductPaymentProviderRepository(): ProductPaymentProviderRepository {
  return {
    async create(handle, data) {
      const provider = await handle.productPaymentProvider.create({ data })
      return parseOrReport(ProductPaymentProviderSchema, provider)
    },
    async delete(handle, productId, paymentProviderId) {
      await handle.productPaymentProvider.delete({
        where: { productId_paymentProviderId: { productId, paymentProviderId } },
      })
    },
    async getAllByProductId(handle, productId) {
      const providers = await handle.productPaymentProvider.findMany({ where: { productId } })
      return providers.map((provider) => parseOrReport(PaymentProviderSchema, provider))
    },
    async productHasPaymentProviderId(handle, productId, paymentProviderId) {
      const provider = await handle.productPaymentProvider.findUnique({
        where: { productId_paymentProviderId: { productId, paymentProviderId } },
        select: {},
      })
      return provider !== null
    },
  }
}
