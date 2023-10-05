"use client"

import { PropsWithChildren } from "react"
import { CompanyDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"
import { Loader } from "@mantine/core"

export default function CompanyDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.company.get.useQuery(params.id)
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
