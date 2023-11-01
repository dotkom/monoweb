import type { NextApiRequest, NextApiResponse } from "next"

import Stripe from "stripe"
import { env } from "@dotkomonline/env"

const stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const priceId = req.query.price_id
      if (!priceId || Array.isArray(priceId)) {
        res.status(500).json({ statusCode: 500, message: "No such priceId" })
        return
      }
      console.log(`${req.headers.host}?success=true`)

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
