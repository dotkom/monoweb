import { Event, JobListing } from "@dotkomonline/types"
import { Anchor, Box, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useMemo } from "react"
import { GenericTable } from "../../../../components/GenericTable"
import { useJobListingDetailsContext } from "./provider"
import Link from "next/link"

export const JobListingEventsPage: FC = () => {
  const { jobListing } = useJobListingDetailsContext()

  const columnHelper = createColumnHelper<JobListing>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventJobListing) => eventJobListing, {
        id: "jobListingEvent",
        header: () => "Navn",
        cell: (info) => {
          return (
            <Anchor component={Link} href={`/event/${info.getValue().id}`}>
              {info.getValue().title}
            </Anchor>
          )
        },
      }),
    ],
    [columnHelper]
  )
  const table = useReactTable<Event>({
    data: jobListing,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Box>
      <Title order={3}>Arrangementer</Title>
      <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne stillingsannonsen.</Text>
      <GenericTable table={table} />
    </Box>
  )
}
