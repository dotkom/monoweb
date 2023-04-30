import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const productPaymentProviders: Insertable<Database["productPaymentProvider"]>[] = [
  {
    productId: "e7babbf1-cdbd-4aa1-942e-ca7c286783c2",
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
  {
    productId: "564c269a-a6bd-4fc9-b278-e8543d679421",
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
]
