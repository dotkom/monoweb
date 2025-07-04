"use client"

import { GenericTable } from "@/components/GenericTable"
import { Icon } from "@iconify/react"
import { Box, Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import { useCreateJobListingModal } from "./modals/create-job-listing-modal"
import { useJobListingAllQuery } from "./queries/use-job-listing-all-query"
import { useJobListingTable } from "./use-job-listing-table"

export default function JobListingPage() {
  const { jobListings, isLoading: isJobListingsLoading } = useJobListingAllQuery()
  const open = useCreateJobListingModal()
  const table = useJobListingTable({ data: jobListings })

  return (
    <Skeleton visible={isJobListingsLoading}>
      <Stack>
        <Box>
          <Button onClick={open}>Opprett stillingsannonse</Button>
        </Box>
        <GenericTable table={table} />
        <ButtonGroup ml="auto">
          <Button variant="subtle">
            <Icon icon="tabler:caret-left" />
          </Button>
          <Button variant="subtle">
            <Icon icon="tabler:caret-right" />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
