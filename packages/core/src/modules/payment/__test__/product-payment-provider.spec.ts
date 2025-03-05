import { randomUUID } from "node:crypto"
import type { PaymentProvider, Product, ProductPaymentProvider } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { ProductPaymentProviderRepositoryImpl } from "../product-payment-provider-repository"
import { ProductPaymentProviderServiceImpl } from "../product-payment-provider-service"
import { productPayload } from "./product-service.spec"

// biome-ignore lint/suspicious/noExportsInTest: this is shared across multiple tests
export const productPaymentProvidersPayload: ProductPaymentProvider[] = [
  {
    productId: randomUUID(),
    paymentProvider: "STRIPE",
    paymentProviderId: randomUUID(),
  },
]

// biome-ignore lint/suspicious/noExportsInTest: this is shared across multiple tests
export const paymentProvidersPayload: PaymentProvider[] = productPaymentProvidersPayload.map((payload) => ({
  paymentProvider: payload.paymentProvider,
  paymentProviderId: payload.paymentProviderId,
}))

describe("ProductPaymentProviderService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const productPaymentProviderRepository = new ProductPaymentProviderRepositoryImpl(db)
  const productPaymentProviderService = new ProductPaymentProviderServiceImpl(productPaymentProviderRepository)

  const productPayloadExtended: Product = {
    ...productPayload,
    id: randomUUID(),
  }

  it("should add payment provider to product", async () => {
    const productPaymentProvider = productPaymentProvidersPayload[0]
    vi.spyOn(productPaymentProviderRepository, "create").mockResolvedValueOnce(productPaymentProvider)
    const result = await productPaymentProviderService.addPaymentProvider(productPaymentProvider)
    expect(result).toEqual(productPaymentProvider)
    expect(productPaymentProviderRepository.create).toHaveBeenCalledWith(productPaymentProvider)
  })

  it("should delete payment provider from product", async () => {
    const productPaymentProvider = productPaymentProvidersPayload[0]
    vi.spyOn(productPaymentProviderRepository, "delete").mockResolvedValueOnce(undefined)
    const result = await productPaymentProviderService.deletePaymentProvider(
      productPayloadExtended.id,
      productPaymentProvider.paymentProvider
    )
    expect(result).toEqual(undefined)
    expect(productPaymentProviderRepository.delete).toHaveBeenCalledWith(
      productPayloadExtended.id,
      productPaymentProvider.paymentProvider
    )
  })

  it("should check if product has payment provider", async () => {
    const productPaymentProvider = productPaymentProvidersPayload[0]
    vi.spyOn(productPaymentProviderRepository, "productHasPaymentProviderId").mockResolvedValueOnce(true)
    const result = await productPaymentProviderService.productHasPaymentProviderId(
      productPayloadExtended.id,
      productPaymentProvider.paymentProviderId
    )
    expect(result).toEqual(true)
    expect(productPaymentProviderRepository.productHasPaymentProviderId).toHaveBeenCalledWith(
      productPayloadExtended.id,
      productPaymentProvider.paymentProviderId
    )
  })
})
