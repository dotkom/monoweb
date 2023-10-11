"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { CompanyDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"

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
