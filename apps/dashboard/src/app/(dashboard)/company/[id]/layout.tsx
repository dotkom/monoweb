"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { trpc } from "../../../../trpc"
import { CompanyDetailsContext } from "./provider"

export default async function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
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
