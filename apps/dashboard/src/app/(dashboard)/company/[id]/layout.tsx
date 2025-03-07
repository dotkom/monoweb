"use client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useTRPC } from "../../../../trpc"
import { CompanyDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.company.get.queryOptions(id))
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
