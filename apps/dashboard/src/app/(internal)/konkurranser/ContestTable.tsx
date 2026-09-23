import { useGroupAbbreviationMap } from "@/app/(internal)/grupper/queries"
import { DateTooltip } from "@/components/DateTooltip"
import { FilterableDataTable } from "@/components/FilterableDataTable"
import type { Contest } from "@dotkomonline/rpc/contest"
import { Badge, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

const RESULT_TYPE_LABELS: Record<string, string> = {
  SCORE: "Poeng",
  DURATION: "Tid",
  WINNER: "Vinner",
}

interface Props {
  contests: Contest[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export const ContestsTable = ({ contests, isLoading, actions }: Props) => {
  const { abbreviationBySlug } = useGroupAbbreviationMap()

  const columnHelper = createColumnHelper<Contest>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        sortingFn: "alphanumeric",
        cell: (info) => <TextLink href={`/konkurranser/${info.row.original.id}`}>{info.getValue()}</TextLink>,
      }),
      columnHelper.accessor("resultType", {
        header: () => "Type",
        enableGlobalFilter: false,
        cell: (info) => RESULT_TYPE_LABELS[info.getValue()] ?? info.getValue(),
      }),
      columnHelper.accessor("groups", {
        header: () => "Komiteer",
        enableGlobalFilter: false,
        cell: (info) =>
          info
            .getValue()
            .map((slug) => abbreviationBySlug.get(slug) ?? slug)
            .join(", "),
      }),
      columnHelper.accessor("winnerContestantId", {
        header: () => "Status",
        enableGlobalFilter: false,
        cell: (info) => (
          <Badge color={info.getValue() ? "gray" : "green"} variant="default">
            {info.getValue() ? "Avsluttet" : "Aktiv"}
          </Badge>
        ),
      }),
      columnHelper.accessor("startDate", {
        header: () => "Startdato",
        enableGlobalFilter: false,
        cell: (info) => {
          const date = info.getValue()
          return date ? <DateTooltip date={new Date(date)} /> : "—"
        },
      }),
    ],
    [abbreviationBySlug, columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: contests,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [contests, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      searchPlaceholder="Søk etter konkurranse..."
      isLoading={isLoading}
      actions={actions}
    />
  )
}
