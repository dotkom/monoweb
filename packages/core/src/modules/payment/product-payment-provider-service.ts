import type { DBHandle } from "@dotkomonline/db"
import type {
  PaymentProvider,
  ProductId,
  ProductPaymentProvider,
  ProductPaymentProviderWrite,
} from "@dotkomonline/types"
import type { ProductPaymentProviderRepository } from "./product-payment-provider-repository"

export interface ProductPaymentProviderService {
  addPaymentProvider(handle: DBHandle, data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null>
  deletePaymentProvider(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<void>
  getAllByProductId(handle: DBHandle, productId: ProductId): Promise<PaymentProvider[]>
  productHasPaymentProviderId(handle: DBHandle, productId: ProductId, paymentProviderId: string): Promise<boolean>
}

export function getProductPaymentProviderService(
  productPaymentProviderRepository: ProductPaymentProviderRepository
): ProductPaymentProviderService {
  return {
    async addPaymentProvider(handle, data) {
      return await productPaymentProviderRepository.create(handle, data)
    },
    async deletePaymentProvider(handle, productId, paymentProviderId) {
      await productPaymentProviderRepository.delete(handle, productId, paymentProviderId)
    },
    async getAllByProductId(handle, productId) {
      return await productPaymentProviderRepository.getAllByProductId(handle, productId)
    },
    async productHasPaymentProviderId(handle, productId, paymentProviderId) {
      return await productPaymentProviderRepository.productHasPaymentProviderId(handle, productId, paymentProviderId)
    },
  }
}
