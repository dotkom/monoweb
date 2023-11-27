import Image from "next/image"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { env } from "@dotkomonline/env"
import { type GetServerSideProps, type InferGetServerSidePropsType } from "next"
import { type User, getServerSession } from "next-auth"
import { useEffect, useState } from "react"
import Stripe from "stripe"
import { type NextPageWithLayout } from "../_app"
import { type CheckoutSessionQuery } from "../api/checkout_sessions"

const stripeLink = (price_id: string, user: User): string => {
  const obj: CheckoutSessionQuery = {
    priceId: price_id,
    userEmail: user.email,
    userFirstName: user.name,
    userLastName: user.name,
    userId: user.id,
  }
  return `/api/checkout_sessions?priceId=${price_id}&userEmail=${obj.userEmail}&userFirstName=${obj.userFirstName}&userLastName=${obj.userLastName}&userId=${obj.userId}`
}

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.")
    }

    if (query.get("canceled")) {
      console.log("Order canceled -- continue to shop around and checkout when you’re ready.")
    }
  }, [])

  // render product
  return <div>hello</div>
}

interface ProductDisplay {
  description: string
  price: string
  price_id: string
  id: string
  image: string
  name: string
}

export const getServerSideProps: GetServerSideProps<{ user: User; products: ProductDisplay[] }> = async ({
  req,
  res,
}) => {
  const session = await getServerSession(req, res, authOptions)
  const stripe = new Stripe(env.PROKOM_STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
  })

  stripe.customers.list()

  const test = await stripe.products.list({
    limit: 20,
  })
  console.log("products: ", test)
  const data = test.data.filter((product) => product.description !== "(created by Stripe CLI)")

  console.log("filteredl", data)

  // for each product, get the price if product has a default_price

  const prices = await Promise.all(
    data.map(async (product) => {
      if (product.default_price) {
        const price = await stripe.prices.retrieve(product.default_price.toString())
        return price
      }
      return null
    })
  )

  const filteredProducts = data
    .filter((product) => product.default_price)
    .map((product) => ({
      name: product.name,
      description: product.description || "No description",
      id: product.id,
      image: product.images[0],
      price_id: product.default_price?.toString() || "No price",
      price:
        prices
          .find((price) => price?.product.toString() === product.id)
          ?.unit_amount?.toString()
          ?.slice(0, -2) || "Problem loading price",
    }))

  if (session === null) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }
  return {
    props: {
      user: session.user,
      products: filteredProducts,
    },
  }
}

export default LandingPage
