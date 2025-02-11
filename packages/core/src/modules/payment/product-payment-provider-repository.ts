import type { DBClient } from "@dotkomonline/db"
import {
  type PaymentProvider,
  PaymentProviderSchema,
  type ProductId,
  type ProductPaymentProvider,
  ProductPaymentProviderSchema,
  type ProductPaymentProviderWrite,
} from "@dotkomonline/types"

export interface ProductPaymentProviderRepository {
  create(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null>
  delete(productId: ProductId, paymentProviderId: string): Promise<PaymentProvider>
  getAllByProductId(productId: ProductId): Promise<PaymentProvider[]>
  productHasPaymentProviderId(productId: ProductId, paymentProviderId: string): Promise<boolean>
}

export class ProductPaymentProviderRepositoryImpl implements ProductPaymentProviderRepository {
  constructor(private readonly db: DBClient) {}

  async create(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | null> {
    return await this.db.productPaymentProvider.create({ data })
  }

  async delete(productId: ProductId, paymentProviderId: string): Promise<PaymentProvider> {
    return await this.db.productPaymentProvider.delete({ where: { productId_paymentProviderId: { productId, paymentProviderId } } })
  }

  async getAllByProductId(productId: ProductId): Promise<PaymentProvider[]> {
    return await this.db.productPaymentProvider.findMany({ where: { productId }})
  }

  async productHasPaymentProviderId(productId: ProductId, paymentProviderId: string): Promise<boolean> {
    return Boolean(await this.db.productPaymentProvider.findUnique({
      where: { productId_paymentProviderId: { productId, paymentProviderId } },
      select: { }
    }))
  }
}
