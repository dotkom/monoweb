"use client"

import { useTRPC } from "@/lib/trpc"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { CompanyDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ slug: string }> }>) {
  const trpc = useTRPC()
  const { slug } = use(params)
  const { data, isLoading } = useQuery(trpc.company.getBySlug.queryOptions(slug))
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <CompanyDetailsContext.Provider value={{ company: data }}>{children}</CompanyDetailsContext.Provider>
      )}
    </>
  )
}
