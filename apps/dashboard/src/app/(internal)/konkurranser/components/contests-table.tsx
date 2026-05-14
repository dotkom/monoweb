import { useGroupAbbreviationMap } from "@/app/(internal)/grupper/queries"
import { DateTooltip } from "@/components/DateTooltip"
import { GenericTable } from "@/components/GenericTable"
import type { Contest } from "@dotkomonline/rpc/contest"
import { Anchor, Badge } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

const RESULT_TYPE_LABELS: Record<string, string> = {
  SCORE: "Poeng",
  DURATION: "Tid",
  WINNER: "Vinner",
}

interface Props {
  contests: Contest[]
}

export const ContestsTable = ({ contests }: Props) => {
  const { abbreviationBySlug } = useGroupAbbreviationMap()

  const columnHelper = createColumnHelper<Contest>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/konkurranser/${info.row.original.id}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor("resultType", {
        header: () => "Type",
        cell: (info) => RESULT_TYPE_LABELS[info.getValue()] ?? info.getValue(),
      }),
      columnHelper.accessor("groups", {
        header: () => "Komiteer",
        cell: (info) =>
          info
            .getValue()
            .map((slug) => abbreviationBySlug.get(slug) ?? slug)
            .join(", "),
      }),
      columnHelper.accessor("winnerContestantId", {
        header: () => "Status",
        cell: (info) => (
          <Badge color={info.getValue() ? "gray" : "green"} variant="light">
            {info.getValue() ? "Avsluttet" : "Aktiv"}
          </Badge>
        ),
      }),
      columnHelper.accessor("startDate", {
        header: () => "Startdato",
        cell: (info) => {
          const date = info.getValue()
          return date ? <DateTooltip date={new Date(date)} /> : "—"
        },
      }),
    ],
    [abbreviationBySlug, columnHelper]
  )

  const table = useReactTable({
    data: contests,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}
