import { z } from "zod"

export const WebshopPurchaseSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  userId: z.string().ulid(),
  stripeProductId: z.string().max(100),
  stripePriceId: z.string().max(100),
  stripeProductName: z.string().max(100),
  delivered: z.boolean(),
  quantity: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
})

export const WebshopPurchaseWriteSchema = WebshopPurchaseSchema.partial({
  id: true,
  createdAt: true,
})

export type WebshopPurchase = z.infer<typeof WebshopPurchaseSchema>
export type WebshopPurchaseId = WebshopPurchase["id"]
export type WebshopPurchaseWrite = z.infer<typeof WebshopPurchaseWriteSchema>
