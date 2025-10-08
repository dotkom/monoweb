"use client"

import { GenericTable } from "@/components/GenericTable"
import type { JobListingFilterQuery } from "@dotkomonline/types"
import { Box, Button, Group, Skeleton, Stack } from "@mantine/core"
import { useState } from "react"
import { JobListingFilters } from "./components/job-listing-filter"
import { useCreateJobListingModal } from "./modals/create-job-listing-modal"
import { useJobListingAllQuery } from "./queries/use-job-listing-all-query"
import { useJobListingTable } from "./use-job-listing-table"

export default function JobListingPage() {
  const [filter, setFilter] = useState<JobListingFilterQuery>({})
  const { jobListings, isLoading: isJobListingsLoading, fetchNextPage } = useJobListingAllQuery({ filter })
  const open = useCreateJobListingModal()
  const table = useJobListingTable({ data: jobListings })

  return (
    <Skeleton visible={isJobListingsLoading}>
      <Stack>
        <Group justify="space-between">
          <JobListingFilters onChange={setFilter} />

          <Box>
            <Button onClick={open}>Opprett stillingsannonse</Button>
          </Box>
        </Group>
        <GenericTable table={table} onLoadMore={fetchNextPage} />
      </Stack>
    </Skeleton>
  )
}
