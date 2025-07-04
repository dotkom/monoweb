"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useCompanyByIdQuery } from "../queries"
import { CompanyDetailsContext } from "./provider"

export default function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = useCompanyByIdQuery(id)
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
