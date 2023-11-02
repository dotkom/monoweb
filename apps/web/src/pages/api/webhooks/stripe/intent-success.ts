import { NextApiRequest, NextApiResponse } from "next"
import { env } from "@dotkomonline/env"

import Stripe from "stripe"

import { createServiceLayer, getStripeObject, getStripeWebhookSecret } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"

export const config = {
  api: {
    bodyParser: false,
  },
}

import { trpc } from "@/utils/trpc"
import { SessionMetadataSchema } from "../../checkout_sessions"

const bufferRequest = (req: NextApiRequest) => {
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

export default async function stripeHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  const sig = req.headers["stripe-signature"] as string

  const stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
  })

  const endpointSecret = env.PROKOM_STRIPE_WEBHOOK_SECRET

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
    console.error(err)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }
  //   @dotkomonline/web:dev: Unhandled event type: product.created
  // @dotkomonline/web:dev: Unhandled event type: price.created
  // @dotkomonline/web:dev: Unhandled event type: payment_intent.created
  // @dotkomonline/web:dev: Unhandled event type: customer.created
  // @dotkomonline/web:dev: Unhandled event type: payment_intent.succeeded
  // @dotkomonline/web:dev: Unhandled event type: charge.succeeded
  console.log(event.type, "-------------------------------------------------------------")
  // console.log(event)

  switch (event.type) {
    case "product.created":
      console.log("product.created")
      break
    case "checkout.session.completed":
      console.log("intent found: ", event.object)
      const id = event.data.object.id // "cs_xxx"

      // Retrieve the Checkout Session with expand
      const session = await stripe.checkout.sessions.retrieve(id, {
        expand: ["line_items"],
      })

      // @dotkomonline/web:dev:     {
      //   @dotkomonline/web:dev:       id: 'li_1O7PJLAPrlt6pRDLI0iB68pq',
      //   @dotkomonline/web:dev:       object: 'item',
      //   @dotkomonline/web:dev:       amount_discount: 0,
      //   @dotkomonline/web:dev:       amount_subtotal: 3000,
      //   @dotkomonline/web:dev:       amount_tax: 0,
      //   @dotkomonline/web:dev:       amount_total: 3000,
      //   @dotkomonline/web:dev:       currency: 'usd',
      //   @dotkomonline/web:dev:       description: 'myproduct',
      //   @dotkomonline/web:dev:       price: [Object],
      //   @dotkomonline/web:dev:       quantity: 2
      //   @dotkomonline/web:dev:     }
      const lineItem = session?.line_items?.data[0]
      const price = lineItem?.price?.unit_amount

      const ctx = await createServiceLayer({ db: kysely })

      const metadata = SessionMetadataSchema.parse(session.metadata)

      await ctx.webshopPurchaseService.create({
        userId: metadata.userId,
        firstName: metadata.userFirstName,
        lastName: metadata.userLastName,
        email: metadata.userEmail,
        delivered: false,
        quantity: 1,
        stripePriceId: lineItem?.price?.id || "Fant ikke produktbeskrivelse",
        stripeProductId: lineItem?.price?.product.toString() || "Fant ikke produktbeskrivelse",
        stripeProductName: lineItem?.description || "Fant ikke produktbeskrivelse",
      })

      console.log("metadata", session.metadata)

      // console.log(price)

      // to save
      // description
      // price
      // quantity

      // Get the quantity
      // console.log(session?.line_items)

      // ctx.webshopPurchaseService.create({
      //   userId: "1",
      //   description: lineItem?.description || "fant ikke pris",
      //   price: price,
      //   quantity: lineItem?.quantity || 0,

      // })
      // })

      // Get the product ID
      // const ctx = await createServiceLayer({ db: kysely })

      // console.log("000000000000000")
      // console.log(event.data)
      // console.log("000000000000000")

      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
      break
  }

  res.status(200).end()
}
