import { Event } from "@dotkomonline/types"
import { Box, Text, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useMemo } from "react"
import { useCompanyEventsAllQuery } from "src/modules/company/queries/use-company-events-all-query"
import { GenericTable } from "../../../../components/GenericTable"
import { useCompanyDetailsContext } from "./provider"

export const CompanyEventsPage: FC = () => {
  const { company } = useCompanyDetailsContext()
  const { companyEvents } = useCompanyEventsAllQuery(company.id)

  const columnHelper = createColumnHelper<Event>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((eventCompany) => eventCompany, {
        id: "companyEvent",
        header: () => "Navn",
        cell: (info) => {
          return info.getValue().title
        },
      }),
    ],
    [columnHelper]
  )
  const table = useReactTable<Event>({
    data: companyEvents,
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
