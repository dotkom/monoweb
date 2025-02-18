import type { Prisma } from "@prisma/client"

export const getProductPaymentProviderFixtures: (
  productIds: string[]
) => Prisma.ProductPaymentProviderCreateManyInput[] = (productIds) => [
  {
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
    productId: productIds[0],
  },
  {
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
    productId: productIds[1],
  },
]
