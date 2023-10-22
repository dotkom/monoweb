"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Card, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useCreateJobListingModal } from "../../../modules/joblisting/modals/create-joblisting-modal"
import { useJobListingAllQuery } from "../../../modules/joblisting/queries/use-joblisting-all-query"
import { useJobListingTable } from "../../../modules/joblisting/use-joblisting-table"

export default function JobListingPage() {
  const { jobListings, isLoading: isJobListingsLoading } = useJobListingAllQuery()
  const open = useCreateJobListingModal()
  const table = useJobListingTable({ data: jobListings })

  return (
    <Skeleton visible={isJobListingsLoading}>
      <Stack>
        <Card withBorder>
          <GenericTable table={table} />
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Opprett stillingsannonse</Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
