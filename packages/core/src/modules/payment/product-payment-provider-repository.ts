import { type Kysely, type Selectable } from "kysely"
import {
  type PaymentProvider,
  PaymentProviderSchema,
  type Product,
  type ProductPaymentProvider,
  ProductPaymentProviderSchema,
  type ProductPaymentProviderWrite,
} from "@dotkomonline/types"
import { type Database } from "@dotkomonline/db"

const mapToProductPaymentProvider = (data: Selectable<Database["productPaymentProvider"]>) =>
  ProductPaymentProviderSchema.parse(data)

const mapToPaymentProvider = (data: Selectable<Database["productPaymentProvider"]>) => PaymentProviderSchema.parse(data)

export interface ProductPaymentProviderRepository {
  addPaymentProvider: (data: ProductPaymentProviderWrite) => Promise<ProductPaymentProvider | undefined>
  deletePaymentProvider: (productId: Product["id"], paymentProviderId: string) => Promise<void>
  getAllByProductId: (productId: Product["id"]) => Promise<PaymentProvider[]>
  productHasPaymentProviderId: (productId: Product["id"], paymentProviderId: string) => Promise<boolean>
}

export class ProductPaymentProviderRepositoryImpl implements ProductPaymentProviderRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | undefined> {
    const productPaymentProvider = await this.db
      .insertInto("productPaymentProvider")
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToProductPaymentProvider(productPaymentProvider)
  }

  async deletePaymentProvider(productId: Product["id"], paymentProviderId: string): Promise<void> {
    await this.db
      .deleteFrom("productPaymentProvider")
      .where("productId", "=", productId)
      .where("paymentProviderId", "=", paymentProviderId)
      .execute()
  }

  async getAllByProductId(productId: Product["id"]): Promise<PaymentProvider[]> {
    const productPaymentProviders = await this.db
      .selectFrom("productPaymentProvider")
      .selectAll()
      .where("productId", "=", productId)
      .execute()

    return productPaymentProviders.map(mapToPaymentProvider)
  }

  async productHasPaymentProviderId(productId: Product["id"], paymentProviderId: string): Promise<boolean> {
    const productPaymentProvider = await this.db
      .selectFrom("productPaymentProvider")
      .selectAll()
      .where("productId", "=", productId)
      .where("paymentProviderId", "=", paymentProviderId)
      .executeTakeFirst()

    return Boolean(productPaymentProvider)
  }
}
