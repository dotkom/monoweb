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
import { useCreateJobListingModal } from "src/modules/joblisting/modals/create-joblisting-modal"
import { useJobListingAllQuery } from "src/modules/jobListing/queries/use-joblisting-all-query"
import { useJobListingTable } from "src/modules/joblisting/use-joblisting-table"

export default function JobListingPage() {
  const { jobListings, isLoading: isJobListingsLoading } = useJobListingAllQuery()
  const open = useCreateJobListingModal()
  const table = useJobListingTable({ data: jobListings })

  return (
    <Skeleton visible={isJobListingsLoading}>
      <Stack>
        <Card withBorder>
          <Table>
            <TableThead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableTr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableTh key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableTh>
                  ))}
                </TableTr>
              ))}
            </TableThead>
            <TableTbody>
              {table.getRowModel().rows.map((row) => (
                <TableTr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              ))}
            </TableTbody>
          </Table>
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
