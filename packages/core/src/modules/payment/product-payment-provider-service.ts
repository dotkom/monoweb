import {
  type PaymentProvider,
  type ProductId,
  type ProductPaymentProvider,
  type ProductPaymentProviderWrite,
} from "@dotkomonline/types"
import { type ProductPaymentProviderRepository } from "./product-payment-provider-repository"

export interface ProductPaymentProviderService {
  addPaymentProvider: (data: ProductPaymentProviderWrite) => Promise<ProductPaymentProvider | undefined>
  deletePaymentProvider: (productId: ProductId, paymentProviderId: string) => Promise<void>
  getAllByProductId: (productId: ProductId) => Promise<PaymentProvider[]>
  productHasPaymentProviderId: (productId: ProductId, paymentProviderId: string) => Promise<boolean>
}

export class ProductPaymentProviderServiceImpl implements ProductPaymentProviderService {
  constructor(private readonly productPaymentProviderRepository: ProductPaymentProviderRepository) {}

  async addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | undefined> {
    return this.productPaymentProviderRepository.addPaymentProvider(data)
  }

  async deletePaymentProvider(productId: ProductId, paymentProviderId: string): Promise<void> {
    return this.productPaymentProviderRepository.deletePaymentProvider(productId, paymentProviderId)
  }

  async getAllByProductId(productId: ProductId): Promise<PaymentProvider[]> {
    return this.productPaymentProviderRepository.getAllByProductId(productId)
  }

  async productHasPaymentProviderId(productId: ProductId, paymentProviderId: string): Promise<boolean> {
    return this.productPaymentProviderRepository.productHasPaymentProviderId(productId, paymentProviderId)
  }
}
