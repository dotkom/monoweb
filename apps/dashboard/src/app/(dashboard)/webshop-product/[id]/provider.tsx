"use client"

import { createContext, useContext } from "react"
import { type WebshopProduct } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
export const ProductDetailsContext = createContext<{
  product: WebshopProduct
} | null>(null)

export const useProductDetailsContext = () => {
  const ctx = useContext(ProductDetailsContext)
  if (ctx === null) {
    throw new Error("useProductDetailsContext called without Provider in tree")
  }
  return ctx
}
