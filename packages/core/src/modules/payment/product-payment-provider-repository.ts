import type { DBHandle } from "@dotkomonline/db"
import type {
  PaymentProvider,
  ProductId,
  ProductPaymentProvider,
  ProductPaymentProviderWrite,
} from "@dotkomonline/types"

export interface ProductPaymentProviderRepository {
  create(handle: DBHandle, data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null>
  delete(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<void>
  getAllByProductId(handle: DBHandle, productId: ProductId): Promise<PaymentProvider[]>
  productHasPaymentProviderId(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<boolean>
}

export function getProductPaymentProviderRepository(): ProductPaymentProviderRepository {
  return {
    async create(handle, data) {
      return await handle.productPaymentProvider.create({ data })
    },
    async delete(handle, productId, paymentProviderId) {
      await handle.productPaymentProvider.delete({
        where: { productId_paymentProviderId: { productId, paymentProviderId } },
      })
    },
    async getAllByProductId(handle, productId) {
      return await handle.productPaymentProvider.findMany({ where: { productId } })
    },
    async productHasPaymentProviderId(handle, productId, paymentProviderId) {
      return Boolean(
        await handle.productPaymentProvider.findUnique({
          where: { productId_paymentProviderId: { productId, paymentProviderId } },
          select: {},
        })
      )
    },
  }
}
