"use client"

import { Icon } from "@iconify/react"
import {
  Button,
  ButtonGroup,
  Card,
  Group,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core"
import { flexRender } from "@tanstack/react-table"
import { useJobListingAllQuery } from "../../../modules/joblisting/queries/use-joblisting-all-query"
import { useCreateJobListingModal } from "../../../modules/joblisting/modals/create-joblisting-modal"
import { useJobListingTable } from "../../../modules/joblisting/use-joblisting-table"
import { GenericTable } from "../../../components/GenericTable"

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
