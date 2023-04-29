import { PaymentProvider } from "@dotkomonline/types"
import { readableStripeAccounts } from "./../../lib/stripe"

export interface PaymentService {
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[]
}

export class PaymentServiceImpl implements PaymentService {
  getPaymentProviders(): (PaymentProvider & { paymentAlias: string })[] {
    return readableStripeAccounts.map(({ alias, publicKey }) => ({
      paymentAlias: alias,
      paymentProvider: "STRIPE",
      paymentProviderId: publicKey,
    }))
  }
}
