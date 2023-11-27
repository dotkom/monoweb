"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { ProductDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"

export default function ProductDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.webshopProduct.getProductBySlug.useQuery({ slug: params.id })
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <ProductDetailsContext.Provider value={{ product: data }}>{children}</ProductDetailsContext.Provider>
      )}
    </>
  )
}
