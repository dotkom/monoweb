"use client"

import { Loader } from "@mantine/core"
import { PropsWithChildren, useCallback } from "react"
import { trpc } from "../../../../utils/trpc"
import { CompanyDetailsContext } from "./provider"

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
