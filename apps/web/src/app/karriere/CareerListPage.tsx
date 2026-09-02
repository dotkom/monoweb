"use client"

import { SearchInput } from "@/components/molecules/ListFilters/SearchInput"
import { useTRPC } from "@/utils/trpc/client"
import type { JobListing } from "@dotkomonline/rpc/job-listing"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@dotkomonline/ui"
import { IconFilter2, IconLayoutGrid, IconLayoutList, IconMoodConfuzed, IconSearch, IconX } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { JobListingCard } from "@/components/molecules/JobListingItem/JobListingCard"
import { JobListingListItem } from "@/components/molecules/JobListingItem/JobListingListItem"
import { JobListingSkeletonList } from "./components/JobListingSkeletonList"
import { JobEmploymentFilter } from "./components/filters/JobEmploymentFilter"
import { JobFilterChips } from "./components/filters/JobFilterChips"
import { JobLocationFilter } from "./components/filters/JobLocationFilter"
import { JobSortFilter } from "./components/filters/JobSortFilter"
import { useJobListingFilters } from "./hooks/useJobListingFilters"
import type { JobListingViewMode } from "./hooks/jobListingViewCookie"
import { useJobListingsView } from "./hooks/useJobListingsView"

interface Props {
  initialViewMode: JobListingViewMode
}

const getLocations = (jobListings: JobListing[]) => {
  const locations = new Set<string>()
  for (const jobListing of jobListings) {
    for (const location of jobListing.locations) {
      locations.add(location.name)
    }
  }

  return Array.from(locations).sort((a, b) => a.localeCompare(b, "nb-NO"))
}

export const CareerListPage = ({ initialViewMode }: Props) => {
  const { view, isCards, setView } = useJobListingsView(initialViewMode)
  const { filters, updateFilters, resetFilters } = useJobListingFilters()

  const trpc = useTRPC()
  const { data: jobListings, isLoading } = useQuery(trpc.jobListing.active.queryOptions())

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchBarOpen, setSearchBarOpen] = useState(filters.search.length > 0)

  const availableLocations = useMemo(() => getLocations(jobListings ?? []), [jobListings])

  const filteredJobListings = useMemo(() => {
    if (!jobListings) {
      return []
    }

    const searchValue = filters.search.trim().toLowerCase()

    return jobListings
      .filter((jobListing) => {
        const matchesSearch =
          !searchValue ||
          jobListing.title.toLowerCase().includes(searchValue) ||
          jobListing.company.name.toLowerCase().includes(searchValue)

        const matchesEmployment =
          filters.employments.length === 0 || filters.employments.includes(jobListing.employment)

        const matchesLocation =
          filters.locations.length === 0 ||
          jobListing.locations.some((location) => filters.locations.includes(location.name))

        return matchesSearch && matchesEmployment && matchesLocation
      })
      .toSorted((jobListing1, jobListing2) => {
        if (filters.sort === "PUBLISHED") {
          return jobListing2.start.getTime() - jobListing1.start.getTime()
        }

        const getDeadlineRank = (jobListing: JobListing) => {
          if (jobListing.deadline != null && !jobListing.rollingAdmission) return 0
          if (jobListing.rollingAdmission) return 1
          return 2
        }

        const rank1 = getDeadlineRank(jobListing1)
        const rank2 = getDeadlineRank(jobListing2)

        if (rank1 !== rank2) return rank1 - rank2
        if (rank1 !== 0) return 0

        return (jobListing1.deadline as Date).getTime() - (jobListing2.deadline as Date).getTime()
      })
      .toSorted((jobListing1, jobListing2) => {
        if (jobListing1.featured && !jobListing2.featured) return -1
        if (!jobListing1.featured && jobListing2.featured) return 1
        return 0
      })
  }, [jobListings, filters])

  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.employments.length > 0 ||
    filters.locations.length > 0 ||
    filters.sort !== "DEADLINE"

  const activeFilterCount =
    filters.employments.length + filters.locations.length + (filters.sort !== "DEADLINE" ? 1 : 0)

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" size="xl">
        Karrieremuligheter
      </Title>
      <Text className="text-gray-600 dark:text-stone-400 -mt-2">
        Ser du etter en jobb? Ta en titt på disse karrieremulighetene.
      </Text>

      <div className="flex min-w-0 justify-between gap-x-2 gap-y-3">
        <div className="flex min-w-0 gap-2 w-full">
          <ToggleGroup
            className="shrink-0 h-10"
            multiple={false}
            spacing={0}
            value={[view]}
            onValueChange={(value) => {
              const nextView = value.at(0)

              if (nextView === "cards" || nextView === "list") {
                setView(nextView)
              }
            }}
          >
            <ToggleGroupItem
              value="list"
              className="flex flex-row items-center gap-2 h-full border-field-border max-[300px]:justify-center max-[300px]:w-12"
            >
              <IconLayoutList className="size-4.5" />
              <Text element="span" className="max-[300px]:hidden">
                Liste
              </Text>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="cards"
              className="flex flex-row items-center gap-2 h-full border-field-border max-[300px]:justify-center max-[300px]:w-12"
            >
              <IconLayoutGrid className="size-4.5" />
              <Text element="span" className="max-[300px]:hidden">
                Kort
              </Text>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="flex justify-end items-stretch gap-2 w-full">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} repositionInputs={false}>
              <DrawerTrigger asChild className="md:hidden">
                <Button variant="outline" className="relative rounded-lg size-10 sm:w-fit sm:h-full">
                  <IconFilter2 className="size-5" />
                  <span className="hidden sm:block text-sm pl-1">Filter</span>
                  {activeFilterCount > 0 && (
                    <div className="absolute -right-2 -top-2 w-5 h-5 text-xs rounded-full flex items-center justify-center bg-blue-100 dark:bg-sky-900 text-blue-900 dark:text-sky-100">
                      {activeFilterCount}
                    </div>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="px-4 overflow-y-auto max-h-[80dvh]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <IconFilter2 className="size-[1.25em]" />
                      Filtrer stillinger
                    </DrawerTitle>
                  </DrawerHeader>

                  <div className="px-4 pt-4 pb-20 sm:grid sm:grid-cols-2 sm:gap-6">
                    <div>
                      <div className="flex flex-col gap-2">
                        <Text element="span" className="h-5.5 font-medium text-sm">
                          Sorter
                        </Text>
                        <JobSortFilter value={filters.sort} onChange={(sort) => updateFilters({ sort })} />
                      </div>
                      <div className="mt-6">
                        <JobEmploymentFilter
                          value={filters.employments}
                          onChange={(employments) => updateFilters({ employments })}
                        />
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-0">
                      <JobLocationFilter
                        value={filters.locations}
                        onChange={(locations) => updateFilters({ locations })}
                        locations={availableLocations}
                      />
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>

            <Button variant="outline" size="icon-xl" onClick={() => setSearchBarOpen((v) => !v)} className="sm:hidden">
              {searchBarOpen ? <IconX className="size-5" /> : <IconSearch className="size-5" />}
            </Button>

            <SearchInput
              initialValue={filters.search}
              onDebouncedChange={(value) => updateFilters({ search: value })}
              placeholder="Søk etter stillinger…"
              className="max-sm:hidden w-full max-w-90"
            />

            <JobSortFilter
              value={filters.sort}
              onChange={(sort) => updateFilters({ sort })}
              className="max-md:hidden"
            />
          </div>
        </div>
      </div>

      {searchBarOpen && (
        <div className="sm:hidden">
          <SearchInput
            initialValue={filters.search}
            onDebouncedChange={(value) => updateFilters({ search: value })}
            placeholder="Søk etter stillinger…"
          />
        </div>
      )}

      <div className="md:grid md:grid-cols-[15rem_auto] md:gap-8 lg:gap-12 min-w-0">
        <div className="max-md:hidden mt-4">
          <JobEmploymentFilter value={filters.employments} onChange={(employments) => updateFilters({ employments })} />
          <div className="mt-6">
            <JobLocationFilter
              value={filters.locations}
              onChange={(locations) => updateFilters({ locations })}
              locations={availableLocations}
            />
          </div>
        </div>

        <div className="mt-2 min-w-0">
          {hasActiveFilters && (
            <JobFilterChips
              searchTerm={filters.search}
              employmentFilter={filters.employments}
              locationFilters={filters.locations}
              sort={filters.sort}
              onRemoveFilter={(type, value) => {
                if (type === "search") {
                  updateFilters({ search: "" })
                }

                if (type === "employment") {
                  updateFilters({ employments: filters.employments.filter((e) => e !== value) })
                }

                if (type === "location") {
                  updateFilters({ locations: filters.locations.filter((l) => l !== value) })
                }

                if (type === "sort") {
                  updateFilters({ sort: "DEADLINE" })
                }
              }}
              onResetAll={resetFilters}
            />
          )}

          <div className={cn("flex flex-col gap-4", isCards && "gap-6")}>
            {isLoading && <JobListingSkeletonList displayMode={isCards ? "cards" : "list"} />}

            {!isLoading && filteredJobListings.length === 0 && (
              <div className="flex flex-col items-center gap-2 p-4">
                <IconMoodConfuzed className="h-10 w-10 text-gray-500 dark:text-stone-500" />
                <Text className="text-gray-500 dark:text-stone-500">Det er ingen stillinger å vise…</Text>
              </div>
            )}

            {!isLoading &&
              filteredJobListings.length > 0 &&
              (isCards ? (
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredJobListings.map((jobListing) => (
                    <JobListingCard key={jobListing.id} jobListing={jobListing} className="h-full min-w-0" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredJobListings.map((jobListing) => (
                    <JobListingListItem key={jobListing.id} jobListing={jobListing} />
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
