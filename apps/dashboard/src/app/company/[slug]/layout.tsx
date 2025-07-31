"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useCompanyBySlugQuery } from "../queries"
import { CompanyDetailsContext } from "./provider"

export default function CompanyDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ slug: string }> }>) {
  const { slug } = use(params)
  const { data, isLoading } = useCompanyBySlugQuery(slug)
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
