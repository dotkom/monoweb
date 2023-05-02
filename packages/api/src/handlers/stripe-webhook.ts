import { NextApiRequest, NextApiResponse } from "next"
import { getStripeObject, getStripeWebhookSecret } from "../lib/stripe"

import Stripe from "stripe"
import { bufferRequest } from "../utils/request-utils"
import { createContextInner } from "../context"

export async function stripeHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  const publicKey = req.query.publickey as string
  const sig = req.headers["stripe-signature"] as string

  const stripe = getStripeObject(publicKey)
  const endpointSecret = getStripeWebhookSecret(publicKey)

  if (!stripe || !endpointSecret) {
    console.warn("No stripe account found for the given public key")
    res.status(400).end()
    return
  }

  let event: Stripe.Event
  try {
    const body = await bufferRequest(req)
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (e) {
    const err = e as Error
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  if (event.type.startsWith("checkout.session")) {
    const ctx = await createContextInner({ auth: null })
    const data = event.data.object as Stripe.Checkout.Session
    const sessionId = data.id

    switch (event.type.split(".").at(-1)) {
      case "completed":
        await ctx.transactionService.fullfillStripeCheckoutSession(sessionId)
        break
      case "expired":
        await ctx.transactionService.expireStripeCheckoutSession(sessionId)
        break
      default:
        // console.log(`Unhandled event type: ${event.type}`)
        break
    }
  }

  res.status(200).end()
}
