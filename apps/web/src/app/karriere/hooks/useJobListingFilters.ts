"use client"

import { EmploymentTypeSchema } from "@dotkomonline/rpc/job-listing"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"
import { z } from "zod"

export const JobListingSortSchema = z.enum(["DEADLINE", "PUBLISHED"])
export type JobListingSort = z.infer<typeof JobListingSortSchema>

const JobListingFiltersSchema = z.object({
  search: z.string(),
  employments: z.array(EmploymentTypeSchema),
  locations: z.array(z.string()),
  sort: JobListingSortSchema,
})

type JobListingFilters = z.infer<typeof JobListingFiltersSchema>

export const useJobListingFilters = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: JobListingFilters = useMemo(() => {
    return JobListingFiltersSchema.parse({
      search: searchParams.get("q") ?? "",
      employments: searchParams.getAll("employment"),
      locations: searchParams.getAll("location"),
      sort: searchParams.get("sort") ?? "DEADLINE",
    })
  }, [searchParams])

  const updateFilters = useCallback(
    (partial: Partial<JobListingFilters>) => {
      const params = new URLSearchParams(searchParams.toString())

      const next = { ...filters, ...partial }

      // search
      params.delete("q")
      if (next.search) params.set("q", next.search)

      // employments
      params.delete("employment")
      for (const e of next.employments) {
        params.append("employment", e)
      }

      // locations
      params.delete("location")
      for (const l of next.locations) {
        params.append("location", l)
      }

      // sort
      params.delete("sort")
      if (next.sort !== "DEADLINE") {
        params.set("sort", next.sort)
      }

      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, filters]
  )

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("employment")
    params.delete("location")
    params.delete("sort")
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  return {
    filters,
    updateFilters,
    resetFilters,
  }
}
