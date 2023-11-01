import Stripe from "stripe"
import { env } from "@dotkomonline/env"

interface StripeAccountDetails {
  publicKey: string
  secretKey: string
  webhookSecret: string
}

const stripeAccounts = {
  fagkomStripe: {
    publicKey: env.FAGKOM_STRIPE_PUBLIC_KEY,
    secretKey: env.FAGKOM_STRIPE_SECRET_KEY,
    webhookSecret: env.FAGKOM_STRIPE_WEBHOOK_SECRET,
  },
  trikomStripe: {
    publicKey: env.TRIKOM_STRIPE_PUBLIC_KEY,
    secretKey: env.TRIKOM_STRIPE_SECRET_KEY,
    webhookSecret: env.TRIKOM_STRIPE_WEBHOOK_SECRET,
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
    return undefined
  }

  return new Stripe(accountDetails.secretKey, {
    apiVersion: "2023-08-16",
  })
}

export function getStripeWebhookSecret(publicKey: string): string | undefined {
  const accountDetails = lookupMap.get(publicKey)
  return accountDetails?.webhookSecret
}
