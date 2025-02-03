"use client"

import { Loader } from "@mantine/core"
import { use, type PropsWithChildren } from "react"
import { trpc } from "../../../../trpc"
import { CompanyDetailsContext } from "./provider"

export default function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = trpc.company.get.useQuery(id)
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
