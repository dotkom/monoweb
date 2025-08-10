import Stripe from "stripe"

export type PaymentProduct = {
  id: string
  name: string
  price: number
  url: string
  imageUrl: string | null
  description: string | undefined
  metadata: Record<string, string>
}

type PaymentProductWrite = Omit<PaymentProduct, "id">

type PriceData = { currency: string; unit_amount: number }
type LoosePriceData = { currency: string; unit_amount: number | null }

type PaymentProductId = PaymentProduct["id"]

const getPriceData = (price: number) => ({ currency: "NOK" as const, unit_amount: price * 100 })
const priceDataEqual = (price_1: LoosePriceData, price_2: LoosePriceData) =>
  price_1.currency.toLowerCase() === price_2.currency.toLowerCase() && price_1.unit_amount === price_2.unit_amount

export interface PaymentProductsService {
  createOrUpdate(productId: string, data: PaymentProductWrite): Promise<void>
}

export function getPaymentProductsService(stripe: Stripe): PaymentProductsService {
  async function findProductById(productId: PaymentProductId) {
    try {
      return await stripe.products.retrieve(productId)
    } catch (e) {
      if (!(e instanceof Stripe.errors.StripeInvalidRequestError)) {
        throw e
      }

      const isNotFound = e && e.code === "resource_missing"
      if (!isNotFound) throw e

      return null
    }
  }

  async function updatePrice(product: Stripe.Product, priceData: PriceData) {
    const existingDefaultPriceId =
      typeof product.default_price === "string" ? product.default_price : product.default_price?.id

    if (existingDefaultPriceId) {
      const defaultPrice = await stripe.prices.retrieve(existingDefaultPriceId)

      if (priceDataEqual(defaultPrice, priceData)) {
        return
      }
    }

    const newPrice = await stripe.prices.create(priceData)
    await stripe.products.update(product.id, {
      default_price: newPrice.id,
    })

    if (existingDefaultPriceId) {
      await stripe.prices.update(existingDefaultPriceId, {
        active: false,
      })
    }
  }

  return {
    createOrUpdate: async (productId, { price, imageUrl, ...data }) => {
      const product = await findProductById(productId)
      const priceData = getPriceData(price)

      const payload = { ...data, images: imageUrl ? [imageUrl] : [] }

      if (product) {
        await stripe.products.update(productId, { ...payload })
        await updatePrice(product, priceData)
      } else {
        await stripe.products.create({ ...payload, id: productId, default_price_data: priceData })
      }
    },
  }
}
