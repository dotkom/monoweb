"use client"

import { CountBadge } from "@/components/molecules/ListFilters/CountBadge"
import { FilterSection } from "@/components/molecules/ListFilters/FilterSection"
import { Button, Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@dotkomonline/ui"
import { IconChevronsDown, IconFilter2 } from "@tabler/icons-react"
import type { JobListingFilters } from "../../hooks/useJobListingFilters"
import { JobEmploymentFilter } from "./JobEmploymentFilter"
import { JobLocationFilter } from "./JobLocationFilter"
import { JobSortFilter } from "./JobSortFilter"

interface JobFilterDrawerProps {
  filters: JobListingFilters
  locations: string[]
  activeFilterCount: number
  onChange: (partial: Partial<JobListingFilters>) => void
}

export function JobFilterDrawer({ filters, locations, activeFilterCount, onChange }: JobFilterDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger
        className="md:hidden"
        render={<Button variant="outline" className="relative rounded-lg size-10 sm:w-fit sm:h-full" />}
      >
        <IconFilter2 className="size-5" />
        <span className="hidden sm:block text-sm pl-1">Filter</span>
        <CountBadge count={activeFilterCount} className="absolute -right-2 -top-2 size-5" />
      </DrawerTrigger>
      <DrawerContent className="max-h-[80dvh] overflow-y-auto">
        <DrawerHeader className="shrink-0 px-8 flex-row items-center justify-between">
          <DrawerTitle className="flex items-center gap-2">
            <IconFilter2 className="size-[1.25em]" />
            Filtrer stillinger
          </DrawerTitle>
          <DrawerClose render={<Button variant="ghost" size="icon" aria-label="Lukk filter" />}>
            <IconChevronsDown className="size-5" />
          </DrawerClose>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
          <div className="flex flex-col gap-6">
            <FilterSection title="Sorter">
              <JobSortFilter value={filters.sort} onChange={(sort) => onChange({ sort })} />
            </FilterSection>
            <JobEmploymentFilter value={filters.employments} onChange={(employments) => onChange({ employments })} />
          </div>

          <div className="max-sm:mt-6">
            <JobLocationFilter
              value={filters.locations}
              onChange={(locations) => onChange({ locations })}
              locations={locations}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
