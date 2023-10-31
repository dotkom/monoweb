import { authOptions } from "@dotkomonline/auth/src/web.app"
import { env } from "@dotkomonline/env"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { User, getServerSession } from "next-auth"
import { useEffect } from "react"
import Stripe from "stripe"
import { NextPageWithLayout } from "../_app"

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  user,
  products,
}) => {
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
  console.log(products)

  // render product
  return (
    <div
      className="mx-10 grid w-full justify-items-start"
      style={{
        gridTemplateColumns: "repeat(auto-fit, 250px)",
      }}
    >
      <h1>Produkter</h1>
      {products.map((product) => (
        <a
          key={product.id}
          className="border-slate-4 block w-64 rounded-md border border-black p-8 shadow-md"
          href={`/api/checkout_sessions?price_id=${product.price_id}`}
        >
          <img className="mt-2" src={product.image} width={200} height={200}></img>
          <p className="mt-4 text-sm">{product.name}</p>
          <p className="text-lg">{product.price} kr</p>
        </a>
      ))}
    </div>
  )
}

type ProductDisplay = {
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

  const test = await stripe.products.list()
  console.log(test)
  const data = test.data

  // for each product, get the price if product has a default_price

  const prices = await Promise.all(
    data.map(async (product) => {
      if (product.default_price) {
        const price = await stripe.prices.retrieve(product.default_price.toString())
        return price
      }
    })
  )

  const filteredProducts = data
    .filter((product) => product.default_price)
    .map((product, index) => {
      return {
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
      }
    })

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
