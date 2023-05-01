import { NextApiRequest, NextApiResponse } from "next"
import { createHash, createHmac } from "crypto"
import { getVippsObject, getVippsWebhookSecret } from "@dotkomonline/api/src/lib/vipps"

import { bufferRequest } from "@/utils/request"
import { createContextInner } from "@dotkomonline/api"

type VippsWebhookEventName =
  | "CREATED"
  | "ABORTED"
  | "EXPIRED"
  | "CANCELLED"
  | "CAPTURED"
  | "REFUNDED"
  | "AUTHORIZED"
  | "TERMINATED"

interface VippsWebhookEvent {
  msn: string // Merchant serial number
  reference: string // Set by us in create payment request
  pspReference: string // Vipps payment reference
  name: VippsWebhookEventName
  amount: number
  timestamp: string
  idempotencyKey: string
  success: boolean
}

function verifyRequest(req: NextApiRequest, body: Buffer, webhookSecret: string): boolean {
  const contentHash = createHash("sha256").update(body.toString(), "utf-8").digest("base64")
  const date = req.headers.date
  const authorization = req.headers.authorization
  if (!date || !authorization) {
    return false
  }

  const signedString = `POST\n${req.url}\n${date};${req.headers.host};${contentHash}`
  const hmacHash = createHmac("sha256", webhookSecret).update(signedString).digest("base64")
  const expectedAuthorization = `HMAC-SHA256 SignedHeaders=x-ms-date;host;x-ms-content-sha256&Signature=${hmacHash}`

  return authorization === expectedAuthorization
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }

  const clientId = req.query.clientid as string
  const vipps = getVippsObject(clientId)
  const webhookSecret = getVippsWebhookSecret(clientId)

  if (!vipps || !webhookSecret) {
    console.warn("No vipps account found for the given client id")
    res.status(400).end()
    return
  }

  const body = await bufferRequest(req)

  if (!verifyRequest(req, body, webhookSecret)) {
    res.status(400).end()
    return
  }

  const event: VippsWebhookEvent = JSON.parse(body.toString())
  const ctx = await createContextInner({ auth: null })

  switch (event.name) {
    case "AUTHORIZED": // Payment was authorized on the user's phone
      await ctx.transactionService.fullfillVippsCheckoutSession(clientId, event.reference)
      break
    case "CANCELLED":
    case "EXPIRED":
    case "ABORTED":
    case "TERMINATED":
      await ctx.transactionService.expireVippsCheckoutSession(event.reference)
      break
    case "REFUNDED":
      await ctx.transactionService.refundVippsPayment(clientId, event.reference)
    default:
      break
  }

  res.status(200).end()
}

export const config = {
  api: {
    bodyParser: false,
  },
}
