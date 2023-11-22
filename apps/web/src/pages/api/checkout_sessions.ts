import { type NextApiRequest, type NextApiResponse } from "next"
import Stripe from "stripe"
import { env } from "@dotkomonline/env"
import { z } from "zod"

const stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

const Schema = z.object({
  userId: z.string(),
  userFirstName: z.string(),
  userLastName: z.string(),
  userEmail: z.string(),
  priceId: z.string(),
})

export type CheckoutSessionQuery = z.infer<typeof Schema>

export const SessionMetadataSchema = z.object({
  userId: z.string(),
  userFirstName: z.string(),
  userLastName: z.string(),
  userEmail: z.string(),
})

export type SessionMetadata = z.infer<typeof SessionMetadataSchema>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      console.log(req.query)
      const { userId, userFirstName, userLastName, userEmail, priceId } = Schema.parse(req.query)

      if (!priceId || Array.isArray(priceId)) {
        res.status(500).json({ statusCode: 500, message: "No such priceId" })
        return
      }
      console.log(`${req.headers.host}?success=true`)

      const metadata: SessionMetadata = {
        userId,
        userFirstName,
        userLastName,
        userEmail,
      }

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://${req.headers.host}?success=true`,
        cancel_url: `http://${req.headers.host}?canceled=true`,
        metadata,
      })
      res.redirect(303, session.url || "google.com")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Internal Server Error"
      res.status(500).json({ statusCode: 500, message: errorMessage })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}
