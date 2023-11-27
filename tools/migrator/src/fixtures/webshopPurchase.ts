import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db" // Assuming this import is correct for your setup

export const webshopPurchases: Insertable<Database["webshopPurchase"]>[] = [
  {
    userId: "01HB64XF7WXBPGVQKFKFGJBH4D",
    stripeProductId: "prod_ABC123",
    stripeProductName: "Premium T-Shirt",
    stripePrice: 2999,
    delivered: false,
    stripePriceId: "price_ABC123",
    quantity: 1,
    email: "example1@email.com",
    firstName: "John",
    lastName: "Doe",
    createdAt: new Date("2023-09-01 10:00:00.000+00"),
  },
  {
    userId: "11HB64XF7WXBPGVQKFKFGJBH4D",
    stripeProductId: "prod_XYZ789",
    stripeProductName: "Coffee Mug",
    stripePrice: 1499,
    delivered: true,
    stripePriceId: "price_XYZ789",
    quantity: 2,
    email: "example2@email.com",
    firstName: "Jane",
    lastName: "Smith",
    createdAt: new Date("2023-09-02 11:00:00.000+00"),
  },
]
