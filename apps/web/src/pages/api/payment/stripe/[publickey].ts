import { NextApiRequest, NextApiResponse } from "next"
import { getStripeObject, getStripeWebhookSecret } from "@dotkomonline/api/src/lib/stripe"

import Stripe from "stripe"
import { createContextInner } from "@dotkomonline/api"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
    const body = await buffer(req)
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

// Everything below is required by stripe
export const config = {
  api: {
    bodyParser: false,
  },
}

const buffer = (req: NextApiRequest) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on("end", () => {
      resolve(Buffer.concat(chunks))
    })

    req.on("error", reject)
  })
}
