"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { JobListingDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"

export default function JobListingDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.jobListing.get.useQuery(params.id)
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <JobListingDetailsContext.Provider value={{ jobListing: data }}>{children}</JobListingDetailsContext.Provider>
      )}
    </>
  )
}
