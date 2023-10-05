import { type NextApiRequest, type NextApiResponse } from "next";

import { createServiceLayer, getStripeObject, getStripeWebhookSecret } from "@dotkomonline/core";
import { kysely } from "@dotkomonline/db";
import type Stripe from "stripe";
import { bufferRequest } from "../request-utils";

export async function stripeHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.status(405).end();

        return;
    }

    const publicKey = req.query.publickey as string;
    const sig = req.headers["stripe-signature"] as string;

    const stripe = getStripeObject(publicKey);
    const endpointSecret = getStripeWebhookSecret(publicKey);

    if (!stripe || !endpointSecret) {
        console.warn("No stripe account found for the given public key");
        res.status(400).end();

        return;
    }

    let event: Stripe.Event;
    try {
        const body = await bufferRequest(req);
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (e) {
        const err = e as Error;
        res.status(400).send(`Webhook Error: ${err.message}`);

        return;
    }

    if (event.type.startsWith("checkout.session")) {
        const ctx = await createServiceLayer({ db: kysely });
        const data = event.data.object as Stripe.Checkout.Session;
        const sessionId = data.id;
        const intentId = data.payment_intent as string;

        switch (event.type.split(".").at(-1)) {
            case "completed":
                await ctx.paymentService.fullfillStripeCheckoutSession(sessionId, intentId);
                break;
            case "expired":
                await ctx.paymentService.expireStripeCheckoutSession(sessionId);
                break;
            default:
                // console.log(`Unhandled event type: ${event.type}`)
                break;
        }
    }

    res.status(200).end();
}
