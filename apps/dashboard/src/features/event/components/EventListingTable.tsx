import { FC } from "react"
import { trpc } from "../../../trpc"
import { Event } from "@dotkomonline/types"
import { EuiBasicTable, EuiButton, EuiBasicTableColumn } from "@elastic/eui"

export const EventListingTable: FC = () => {
  // TODO: Tables
  const { data = [], isLoading } = trpc.event.all.useQuery({ limit: 50, offset: 0 })
  const columns: EuiBasicTableColumn<Event>[] = [
    {
      name: "Tittel",
      field: "title",
      truncateText: true,
    },
    {
      name: "Startdato",
      field: "start",
    },
    {
      name: "Sluttdato",
      field: "end",
    },
    {
      name: "Arrangør",
      field: "committeeId",
    },
    {
      name: "Type",
      field: "type",
    },
    {
      name: "Detaljer",
      render: () => <EuiButton iconType="wrench">Se mer</EuiButton>,
    },
  ]

  return <EuiBasicTable columns={columns} items={data} />
}
