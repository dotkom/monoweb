import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const productPaymentProviders: Insertable<Database["productPaymentProvider"]>[] = [
  {
    productId: "01HB64TWZMXJEXKB3M7RQ705E5",
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
  {
    productId: "01HB64TWZM3GN9R4DEYK0Q6RZG",
    paymentProvider: "STRIPE",
    paymentProviderId: "pk_test_t3JLACvjcDHrHyEQEkQYm3Hz",
  },
]
