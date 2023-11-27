import { z } from "zod"

export const WebshopProduct = z.object({
  name: z.string(),
  price: z.number(),
  images: z.array(z.string()),
  variations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
      priceId: z.string(),
    })
  ),
})

export const WebshopProductWriteSchema = z.object({
  // in general for product
  name: z.string(),
  images: z.array(z.string()),
  price: z.number(),
  productId: z.string(),

  // variant spesific
  variantDescription: z.string(),
  quantity: z.number(),
})

export type WebshopProduct = z.infer<typeof WebshopProduct>
export type WebshopProductWrite = z.infer<typeof WebshopProductWriteSchema>
