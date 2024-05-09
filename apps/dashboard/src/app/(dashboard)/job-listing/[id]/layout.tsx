"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../utils/trpc"
import { JobListingDetailsContext } from "./provider"

export default function JobListingDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.jobListing.get.useQuery(params.id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
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
