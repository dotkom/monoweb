import { env } from "@dotkomonline/env"
import Stripe from "stripe"
import { StripeProductRepositoryImpl } from "../stripe-repository"
import { WebshopProductServiceImpl } from "../stripe-product-service"

describe("EventService", async () => {
  it("workd", async () => {
    console.log("hello")
    const stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, {
      apiVersion: "2023-08-16",
    })

    const repo = new StripeProductRepositoryImpl(stripe)

    const test = await repo.getProductById("prod_Ov9NYgqWgHoud0")
    if (!test) {
      throw new Error("test is undefined")
    }
    // const test = await repo.getProductsByMetadata("product_slug", "henrik_genser")

    test.metadata.product_slug = "henrik_genser2"

    const test2 = await repo.updateProduct(test.id, {
      name: "fra test",
    })

    console.log(test2)

    console.log(test)
  })

  it("service works", async () => {
    console.log("hello from service")

    const repo = new StripeProductRepositoryImpl(new Stripe(env.PROKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" }))
    const service = new WebshopProductServiceImpl(repo)

    const test = await service.getActiveProducts()

    console.log(test)
  })
})
