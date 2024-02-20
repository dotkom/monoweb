import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db" // Assuming this import is correct for your setup

// Combined Products and Variants
export const webshopProductsAndVariants: (Insertable<Database["webshopProduct"]> & {
  variants: Insertable<Database["webshopProductVariant"]>[]
})[] = [
  {
    name: "T-Shirt",
    description: "High-quality cotton t-shirt",
    price: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "https://i.imgur.com/EHyR2nP.png",
    variants: [
      { name: "Small", stockQuantity: 100 },
      { name: "Medium", stockQuantity: 100 },
      { name: "Large", stockQuantity: 100 },
    ],
  },
  {
    name: "Coffee Mug",
    description: "Ceramic coffee mug",
    price: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "https://i.imgur.com/EHyR2nP.png",
    variants: [
      { name: "White", stockQuantity: 200 },
      { name: "Black", stockQuantity: 200 },
      { name: "Blue", stockQuantity: 200 },
    ],
  },
  {
    name: "Backpack",
    description: "Durable outdoor backpack",
    price: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "https://i.imgur.com/EHyR2nP.png",
    variants: [
      { name: "Red", stockQuantity: 50 },
      { name: "Green", stockQuantity: 50 },
      { name: "Blue", stockQuantity: 50 },
    ],
  },
  {
    name: "Water Bottle",
    description: "Insulated water bottle",
    price: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    image: "https://i.imgur.com/EHyR2nP.png",
    variants: [
      { name: "500ml", stockQuantity: 150 },
      { name: "750ml", stockQuantity: 150 },
      { name: "1000ml", stockQuantity: 150 },
    ],
  },
]

export const getProductsToInsert = (): Insertable<Database["webshopProduct"]>[] =>
  webshopProductsAndVariants.map(({ variants: _variants, ...rest }) => rest)

export const getVariantsToInsert = (productIds: string[]): Insertable<Database["webshopProductVariant"]>[] =>
  webshopProductsAndVariants
    .map(({ variants }, index) => variants.map((variant) => ({ ...variant, productId: productIds[index] })))
    .flat()
