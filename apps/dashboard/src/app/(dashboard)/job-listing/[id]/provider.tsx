"use client"

import { createContext, useContext } from "react"
import { JobListing } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
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
