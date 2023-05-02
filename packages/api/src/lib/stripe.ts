import Stripe from "stripe"

interface StripeAccountDetails {
  publicKey: string
  secretKey: string
  webhookSecret: string
}

const stripeAccounts: { [accountOwner: string]: StripeAccountDetails } = {
  fagkomStripe: {
    publicKey: process.env.FAGKOM_STRIPE_PUBLIC_KEY as string,
    secretKey: process.env.FAGKOM_STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.FAGKOM_STRIPE_WEBHOOK_SECRET as string,
  },
  trikomStripe: {
    publicKey: process.env.TRIKOM_STRIPE_PUBLIC_KEY as string,
    secretKey: process.env.TRIKOM_STRIPE_SECRET_KEY as string,
    webhookSecret: process.env.TRIKOM_STRIPE_WEBHOOK_SECRET as string,
  },
} as const

const lookupMap = new Map<string, Omit<StripeAccountDetails, "publicKey">>(
  Array.from(Object.values(stripeAccounts)).map((a) => [
    a.publicKey,
    { secretKey: a.secretKey, webhookSecret: a.webhookSecret },
  ])
)

export const stripePublicIds = Array.from(lookupMap.keys())
export const readableStripeAccounts = Array.from(Object.entries(stripeAccounts)).map(([k, v]) => ({
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
  return accountDetails?.webhookSecret
}
