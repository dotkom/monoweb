import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"

export const getProductPaymentProviderFixtures: (
  productIds: string[]
) => Insertable<Database["productPaymentProvider"]>[] = (productIds) => [
  {
    productId: productIds[0],
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
  {
    productId: productIds[1],
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
]
