import Stripe from "stripe"
import {
  PaymentAlreadyChargedError,
  PaymentAmbiguousPriceError,
  PaymentMissingPriceError,
  PaymentNotReadyToCharge,
} from "./payment-error"
import z from "zod"

export type ProductPayment = {
  url: string
  id: string
}

export interface PaymentService {
  createOrUpdateProduct(productId: string, name: string, price: number): Promise<string>
  createProductPayment(productId: string, price: number, redirect: string): Promise<ProductPayment>
  cancelProductPayment(paymentId: string): Promise<void>
  chargeProductPayment(paymentId: string): Promise<void>
}

type PriceData = { currency: string; unit_amount: number | null }

const getPriceData = (price: number) => ({ currency: "NOK" as const, unit_amount: price * 100 })
const priceDataEqual = (price_1: PriceData, price_2: PriceData) =>
  price_1.currency.toLowerCase() === price_2.currency.toLowerCase() && price_1.unit_amount === price_2.unit_amount

export function getPaymentService(stripe: Stripe): PaymentService {
  const createProduct = async (productId: string, name: string, price: number) => {
    const product = await stripe.products.create({
      name,
      id: productId,
      default_price_data: getPriceData(price),
    })

    if (!product.default_price) {
      throw new Error("Default price was not created")
    }

    return typeof product.default_price === "string" ? product.default_price : product.default_price.id
  }

  const updateProduct = async (productId: string, name: string, newPrice: number) => {
    const newPriceData = getPriceData(newPrice)

    const activeStripePrice = await getActiveProductStripePrice(productId)

    let defaultPriceId = activeStripePrice.id
    let oldStripePriceId = null
    if (!priceDataEqual(activeStripePrice, newPriceData)) {
      const newStripePrice = await stripe.prices.create({ ...newPriceData, product: productId })

      defaultPriceId = newStripePrice.id
      oldStripePriceId = activeStripePrice.id
    }

    await stripe.products.update(productId, {
      default_price: defaultPriceId,
      name,
    })

    if (oldStripePriceId !== null) {
      await stripe.prices.update(oldStripePriceId, { active: false })
    }

    return defaultPriceId
  }

  const getActiveProductStripePrice = async (productId: string): Promise<Stripe.Price> => {
    const { data: prices } = await stripe.prices.list({
      active: true,
      product: productId,
    })

    if (prices.length === 0) {
      throw new PaymentMissingPriceError(productId)
    }

    if (prices.length > 1) {
      throw new PaymentAmbiguousPriceError(productId)
    }

    const activePrice = prices[0]

    return activePrice
  }

  return {
    createOrUpdateProduct: async (productId, name, price) => {
      try {
        await stripe.products.retrieve(productId)
      } catch (e) {
        if (!(e instanceof Stripe.errors.StripeInvalidRequestError)) {
          throw e
        }

        // If product does not exist
        return await createProduct(productId, name, price)
      }

      return await updateProduct(productId, name, price)
    },
    createProductPayment: async (productId, price, redirect) => {
      const priceData = getPriceData(price)
      const activePrice = await getActiveProductStripePrice(productId)

      // Sanity check to not prank the user
      if (!priceDataEqual(activePrice, priceData)) {
        throw new Error("Active price did not match expected price")
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: activePrice.id, quantity: 1 }],
        payment_intent_data: { capture_method: "manual" },
        success_url: redirect,
        cancel_url: redirect,
        mode: "payment",
      })

      if (!session.url) {
        throw new Error("URL was not created for product")
      }

      return { id: session.id, url: session.url }
    },
    cancelProductPayment: async (paymentId: string) => {
      const session = await stripe.checkout.sessions.retrieve(paymentId)

      if (session.payment_intent !== null) {
        let paymentIntent: Stripe.PaymentIntent
        if (typeof session.payment_intent === "string") {
          paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
        } else {
          paymentIntent = session.payment_intent
        }

        if (paymentIntent.status === "succeeded") {
          throw new PaymentAlreadyChargedError(paymentId)
        }

        if (paymentIntent.status !== "canceled") {
          await stripe.paymentIntents.cancel(paymentIntent.id)
        }
      }

      if (session.status !== "complete") {
        await stripe.checkout.sessions.expire(paymentId)
      }
    },
    chargeProductPayment: async (paymentId: string) => {
      const session = await stripe.checkout.sessions.retrieve(paymentId)

      if (session.payment_intent === null) {
        throw new PaymentNotReadyToCharge(paymentId)
      }

      let paymentIntent: Stripe.PaymentIntent
      if (typeof session.payment_intent === "string") {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
      } else {
        paymentIntent = session.payment_intent
      }

      if (paymentIntent.status === "succeeded") {
        throw new PaymentAlreadyChargedError(paymentId)
      }

      await stripe.paymentIntents.capture(paymentIntent.id);
    },
  }
}
