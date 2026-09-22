"use client"

import type { JobListingFilterQuery } from "@dotkomonline/rpc/job-listing"
import { useState } from "react"

import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { JobListingFilters } from "./JobListingFilters"
import { JobListingTable } from "./JobListingTable"
import { useJobListingAllQuery } from "./queries"

export default function JobListingPage() {
  const [filter, setFilter] = useState<JobListingFilterQuery>({})
  const { jobListings, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useJobListingAllQuery({ filter })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Stillingsannonser
      </Title>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <JobListingFilters onChange={setFilter} defaultValues={filter} />
          <Button variant="default" size="lg" element={Link} href="/karriere/ny" icon={<IconPencil />}>
            Ny stillingsannonse
          </Button>
        </div>

        <JobListingTable
          data={jobListings}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  )
}
