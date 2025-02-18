"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { JobListingDetailsContext } from "./provider"

export default function JobListingDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = trpc.jobListing.get.useQuery(id)
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
