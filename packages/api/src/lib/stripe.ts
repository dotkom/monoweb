import Stripe from "stripe"

interface StripeAccountDetails {
  publicKey: string
  secretKey: string
  webhookSecret: string
}

const stripeAccountsMap = new Map<string, StripeAccountDetails>()

if (process.env.NODE_ENV === "production") {
  stripeAccountsMap.set("monowebStripe", {
    publicKey: process.env.MONOWEB_STRIPE_PUBLIC_KEY as string,
    secretKey: process.env.MONOWEB_STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.MONOWEB_STRIPE_WEBHOOK_SECRET as string,
  })
} else {
  stripeAccountsMap.set("testStripe", {
    publicKey: process.env.TEST_STRIPE_PUBLIC_KEY as string,
    secretKey: process.env.TEST_STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.TEST_STRIPE_WEBHOOK_SECRET as string,
  })
}

const lookupMap = new Map<string, Omit<StripeAccountDetails, "publicKey">>(
  Array.from(stripeAccountsMap.values()).map((a) => [
    a.publicKey,
    { secretKey: a.secretKey, webhookSecret: a.webhookSecret },
  ])
)

export const stripePublicIds = Array.from(lookupMap.keys())
export const readableStripeAccounts = Array.from(stripeAccountsMap.entries()).map(([k, v]) => ({
  alias: k,
  publicKey: v.publicKey,
}))

export function getStripeObject(publicKey: string): Stripe | undefined {
  const accountDetails = lookupMap.get(publicKey)
  if (!accountDetails) {
    return
  }

  return new Stripe(accountDetails.secretKey, {
    apiVersion: "2022-11-15",
  })
}

export function getStripeWebhookSecret(publicKey: string): string | undefined {
  const accountDetails = lookupMap.get(publicKey)
  if (!accountDetails) {
    return
  }

  return accountDetails.webhookSecret
}
