import type {
  PaymentProvider,
  ProductId,
  ProductPaymentProvider,
  ProductPaymentProviderWrite,
} from "@dotkomonline/types"
import type { ProductPaymentProviderRepository } from "./product-payment-provider-repository"

export interface ProductPaymentProviderService {
  addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null>
  deletePaymentProvider(productId: ProductId, paymentProviderId: string): Promise<void>
  getAllByProductId(productId: ProductId): Promise<PaymentProvider[]>
  productHasPaymentProviderId(productId: ProductId, paymentProviderId: string): Promise<boolean>
}

export class ProductPaymentProviderServiceImpl implements ProductPaymentProviderService {
  private readonly productPaymentProviderRepository: ProductPaymentProviderRepository

  constructor(productPaymentProviderRepository: ProductPaymentProviderRepository) {
    this.productPaymentProviderRepository = productPaymentProviderRepository
  }

  async addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null> {
    return await this.productPaymentProviderRepository.create(data)
  }

  async deletePaymentProvider(productId: ProductId, paymentProviderId: string): Promise<void> {
    await this.productPaymentProviderRepository.delete(productId, paymentProviderId)
  }

  async getAllByProductId(productId: ProductId): Promise<PaymentProvider[]> {
    return await this.productPaymentProviderRepository.getAllByProductId(productId)
  }

  async productHasPaymentProviderId(productId: ProductId, paymentProviderId: string): Promise<boolean> {
    return await this.productPaymentProviderRepository.productHasPaymentProviderId(productId, paymentProviderId)
  }
}
