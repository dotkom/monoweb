import { env } from "@dotkomonline/env"
import { type NextApiRequest, type NextApiResponse } from "next"
import Stripe from "stripe"
import { createServiceLayer } from "@dotkomonline/core"
import { kysely } from "@dotkomonline/db"

export const config = {
  api: {
    bodyParser: false,
  },
}

import { SessionMetadataSchema } from "../../checkout_sessions"

const bufferRequest = async (req: NextApiRequest) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []

    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on("end", () => {
      resolve(Buffer.concat(chunks))
    })

    req.on("error", reject)
  })

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

  if (!endpointSecret) {
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

  switch (event.type) {
    case "product.created":
      console.log("product.created")
      break
    case "checkout.session.completed": {
      console.log("intent found: ", event.object)
      const id = event.data.object.id // "cs_xxx"

      // Retrieve the Checkout Session with expand
      const session = await stripe.checkout.sessions.retrieve(id, {
        expand: ["line_items"],
      })

      const lineItem = session.line_items?.data[0]
      const price = Number(lineItem?.price?.unit_amount) / 100

      console.log("PRICE", typeof price)

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
        stripePrice: price || 0,
      })

      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
      break
  }

  res.status(200).end()
}
