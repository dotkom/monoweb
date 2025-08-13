import { GenericTable } from "@/components/GenericTable"
import type { EventDetail } from "@dotkomonline/types"
import { Anchor, Box, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { type FC, useMemo } from "react"
import { useCompanyEventsAllQuery } from "../queries"
import { useCompanyDetailsContext } from "./provider"

export const CompanyEventsPage: FC = () => {
  const { company } = useCompanyDetailsContext()
  const { events } = useCompanyEventsAllQuery(company.id)

  const columnHelper = createColumnHelper<EventDetail>()
  const columns = useMemo(
    () => [
      columnHelper.accessor(({ event }) => event, {
        id: "companyEvent",
        header: () => "Navn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/event/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )
  const table = useReactTable<EventDetail>({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Box>
      <Title order={3}>Arrangementer</Title>
      <Text>Dette er en oversikt over hvilke arrangementer som er tilknyttet denne bedriften.</Text>
      <GenericTable table={table} />
    </Box>
  )
}
