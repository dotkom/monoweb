"use client"
import { Loader } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { type PropsWithChildren, use, useMemo } from "react"
import { useTRPC } from "@/lib/trpc-client"
import { JobListingDetailsContext } from "./provider"

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
