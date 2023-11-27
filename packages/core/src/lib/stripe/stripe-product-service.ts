import { type WebshopProductWrite, type WebshopProduct } from "@dotkomonline/types"
import { type Stripe } from "stripe"
import { ulid } from "ulid"
import { z } from "zod"
import { type StripeProductRepository } from "./stripe-repository"

const ProductVariantMetadata = z.object({
  stock_quantity: z.string().optional(),
  product_slug: z.string(),
})

const mapToWebshopProduct = (products: Stripe.Product[]): WebshopProduct => {
  const variations = products.map((product) => {
    const price = product.default_price as Stripe.Price

    const metadata = ProductVariantMetadata.parse(product.metadata)
    return {
      id: product.id,
      name: product.name,
      quantity: Number(metadata.stock_quantity),
      priceId: price.id,
    }
  })

  // consistency checks
  const price = products[0].default_price as Stripe.Price
  const unitPrice = price.unit_amount
  const name = products[0].name
  const description = products[0].description
  const images = products[0].images

  //   check if any are not defined
  if (!unitPrice || !name || !description) {
    throw new Error(`Product is missing required fields: ${JSON.stringify(products[0], null, 2)}`)
  }

  return {
    name,
    description,
    price: unitPrice,
    images,
    variations,
  }
}

export interface WebshopProductService {
  getActiveProducts(): Promise<WebshopProduct[]>
  getProductBySlug(slug: string): Promise<WebshopProduct | undefined>

  archiveProduct(id: string): Promise<Stripe.Product>
  updateProduct(id: string, product: Stripe.ProductUpdateParams): Promise<Stripe.Product>
  createBaseProduct(product: WebshopProductWrite): Promise<Stripe.Product>
  createProductVariant(
    baseProduct: WebshopProductWrite,
    slug: string,
    type: string,
    quantity: number,
    name: string
  ): Promise<Stripe.Product>
}

export class WebshopProductServiceImpl implements WebshopProductService {
  constructor(private readonly stripeRepository: StripeProductRepository) {}

  private groupByMetadataSlug(products: Stripe.Product[]): Stripe.Product[][] {
    const grouped: Record<string, Stripe.Product[]> = {}
    for (const product of products) {
      const slug = product.metadata.product_slug
      if (!slug) {
        throw new Error(`Product is missing product_slug metadata: ${JSON.stringify(product, null, 2)}`)
      }
      if (!Object.hasOwn(grouped, slug)) {
        grouped[slug] = []
      }
      grouped[slug].push(product)
    }

    // return nested array instead of object
    return Object.values(grouped)
  }

  async getActiveProducts(): Promise<WebshopProduct[]> {
    const stripeProducts = await this.stripeRepository.getProductsByMetadata("active", "true")
    console.log(stripeProducts)
    const grouped = this.groupByMetadataSlug(stripeProducts)
    return grouped.map(mapToWebshopProduct)
  }

  async archiveProduct(id: string): Promise<Stripe.Product> {
    return await this.stripeRepository.updateProduct(id, {
      active: false,
    })
  }

  async updateProduct(id: string, product: Stripe.ProductUpdateParams): Promise<Stripe.Product> {
    return await this.stripeRepository.updateProduct(id, product)
  }

  async getProductBySlug(slug: string): Promise<WebshopProduct | undefined> {
    const products = await this.stripeRepository.getProductsByMetadata("product_slug", slug)
    if (products.length === 0) {
      return undefined
    }
    return mapToWebshopProduct(products)
  }

  async createBaseProduct(product: WebshopProductWrite): Promise<Stripe.Product> {
    const metadata = {
      product_slug: ulid(),
      variant: "base",
      active: "true",
    }
    return await this.stripeRepository.createProduct({
      name: product.name,
      description: product.variantDescription,
      images: product.images,
      default_price_data: {
        currency: "nok",
        unit_amount: product.price,
      },
      metadata,
    })
  }

  async createProductVariant(
    baseProduct: WebshopProductWrite,
    slug: string,
    type: string,
    quantity: number,
    name: string
  ): Promise<Stripe.Product> {
    const metadata = {
      product_slug: slug,
      variant: type,
      variant_name: name,
      active: "true",
      stock_quantity: quantity,
    }
    return await this.stripeRepository.createProduct({
      name: baseProduct.name,
      description: baseProduct.variantDescription,
      images: baseProduct.images,
      default_price_data: {
        currency: "nok",
        unit_amount: baseProduct.price,
      },
      metadata,
    })
  }
}
