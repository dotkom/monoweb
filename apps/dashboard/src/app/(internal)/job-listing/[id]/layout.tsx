"use client"
import { useTRPC } from "@/lib/trpc-client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { JobListingDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function JobListingDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.jobListing.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            jobListing: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <JobListingDetailsContext.Provider value={value}>{children}</JobListingDetailsContext.Provider>
}
