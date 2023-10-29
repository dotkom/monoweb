"use client"

import { Loader } from "@mantine/core"
import { PropsWithChildren } from "react"
import { trpc } from "../../../../utils/trpc"
import { JobListingDetailsContext } from "./provider"

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
