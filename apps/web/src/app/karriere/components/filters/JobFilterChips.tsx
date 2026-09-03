"use client"

import { JOB_LISTING_EMPLOYMENT_CONFIG } from "@/components/molecules/JobListingItem/jobListingTypeConfig"
import { FilterChips, type FilterChip } from "@/components/molecules/ListFilters/FilterChips"
import type { JobListingEmployment } from "@dotkomonline/rpc/job-listing"
import type { JobListingSort } from "../../hooks/useJobListingFilters"

type FilterType = "search" | "employment" | "location" | "sort"

interface JobFilterChipsProps {
  searchTerm: string
  employmentFilter: JobListingEmployment[]
  locationFilters: string[]
  sort: JobListingSort
  onRemoveFilter: (filterType: FilterType, value?: string) => void
  onResetAll: () => void
}

export const JobFilterChips = ({
  searchTerm,
  employmentFilter,
  locationFilters,
  sort,
  onRemoveFilter,
  onResetAll,
}: JobFilterChipsProps) => {
  const chips: FilterChip[] = []

  if (searchTerm) {
    chips.push({ key: `search-${searchTerm}`, label: `'${searchTerm}'`, onRemove: () => onRemoveFilter("search") })
  }

  for (const employment of employmentFilter) {
    chips.push({
      key: `employment-${employment}`,
      label: JOB_LISTING_EMPLOYMENT_CONFIG[employment].label,
      onRemove: () => onRemoveFilter("employment", employment),
    })
  }

  for (const location of locationFilters) {
    chips.push({
      key: `location-${location}`,
      label: location,
      onRemove: () => onRemoveFilter("location", location),
    })
  }

  if (sort === "PUBLISHED") {
    chips.push({
      key: `sort-${sort}`,
      label: "Sorter etter publiseringsdato",
      onRemove: () => onRemoveFilter("sort"),
    })
  }

  return <FilterChips chips={chips} onResetAll={onResetAll} className="mb-4" />
}
