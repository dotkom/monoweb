"use client"

import type { JobListing } from "@dotkomonline/rpc/job-listing"
import { createContext, useContext } from "react"

export const JobListingDetailsContext = createContext<{
  jobListing: JobListing
} | null>(null)

export const useJobListingDetailsContext = () => {
  const ctx = useContext(JobListingDetailsContext)
  if (ctx === null) {
    throw new Error("useJobListingDetailsContext called without Provider in tree")
  }
  return ctx
}
