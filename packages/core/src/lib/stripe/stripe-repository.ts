import { env } from "@dotkomonline/env"
import Stripe from "stripe"

export interface StripeProductRepository {
  getProductsByMetadata(key: string, value: string): Promise<Stripe.Product[]>
  getProductById(id: string): Promise<Stripe.Product | undefined>
  updateProduct(id: string, product: Stripe.ProductUpdateParams): Promise<Stripe.Product>
  createProduct(product: Stripe.ProductCreateParams): Promise<Stripe.Product>
}

export class StripeProductRepositoryImpl implements StripeProductRepository {
  constructor(
    private readonly stripe: Stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" })
  ) {}

  async getProductsByMetadata(key: string, value: string): Promise<Stripe.Product[]> {
    const res = await this.stripe.products.search({
      query: `metadata['${key}']:'${value}'`,
      expand: ["data.default_price"],
    })

    return res.data
  }

  async updateProduct(id: string, updateParams: Stripe.ProductUpdateParams): Promise<Stripe.Product> {
    return await this.stripe.products.update(id, updateParams)
  }

  async getProductById(id: string): Promise<Stripe.Product | undefined> {
    try {
      const res = await this.stripe.products.retrieve(id, {
        expand: ["default_price"],
      })

      return res

      // make typescript understand e is a StripeError
    } catch (e: unknown) {
      if (e instanceof Stripe.errors.StripeError) {
        if (e.code === "resource_missing") {
          return undefined
        }
      }
      throw e
    }
  }
  async createProduct(product: Stripe.ProductCreateParams): Promise<Stripe.Product> {
    return await this.stripe.products.create({
      name: product.name,
      description: product.description,
      images: product.images,
      default_price_data: product.default_price_data,
      metadata: product.metadata,
    })
  }
}
