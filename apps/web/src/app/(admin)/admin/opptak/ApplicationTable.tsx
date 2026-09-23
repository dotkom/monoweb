import { DateTooltip } from "@admin/components/DateTooltip"
import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import type { CommitteeApplicationPeriod } from "@dotkomonline/rpc/committee-application"
import { Badge, TextLink } from "@dotkomonline/ui"
import { IconEyeDotted } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"
import { toLocalInterviewDate } from "./validation"

const columnHelper = createColumnHelper<CommitteeApplicationPeriod>()

const DATE_COLUMNS = [
  ["applicationsOpenAt", "Søknadsstart", true],
  ["applicationsCloseAt", "Søknadsslutt", true],
  ["interviewsStartDate", "Intervjustart", false],
  ["interviewsEndDate", "Intervjuslutt", false],
] as const

const columns = [
  columnHelper.accessor("name", {
    header: () => "Navn",
    sortingFn: "alphanumeric",
    enableGlobalFilter: true,
    cell: (info) => (
      <TextLink href={`/admin/opptak/${info.row.original.id}`} className="flex items-center gap-2">
        {info.getValue()}
        {info.row.original.isDraft && (
          <Badge
            color="orange"
            variant="secondary"
            className="inline-flex items-center gap-1 text-[0.625rem] h-5 px-1.5"
          >
            <IconEyeDotted className="size-3" />
            Utkast
          </Badge>
        )}
      </TextLink>
    ),
  }),
  columnHelper.accessor("isEnabled", {
    header: () => "Aktivt",
    cell: (info) => (
      <Badge color={info.getValue() ? "blue" : "gray"} variant="default">
        {info.getValue() ? "Ja" : "Nei"}
      </Badge>
    ),
  }),
  ...DATE_COLUMNS.map(([field, header, isTimestamp]) =>
    columnHelper.accessor(field, {
      header: () => header,
      cell: (info) => <DateTooltip date={isTimestamp ? info.getValue() : toLocalInterviewDate(info.getValue())} />,
    })
  ),
]

interface ApplicationTableProps {
  applicationPeriods: CommitteeApplicationPeriod[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export const ApplicationTable = ({ applicationPeriods, isLoading, actions }: ApplicationTableProps) => {
  const tableOptions = useMemo(
    () => ({
      data: applicationPeriods,
      getCoreRowModel: getCoreRowModel(),
      defaultColumn: { enableGlobalFilter: false },
      columns,
    }),
    [applicationPeriods]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      searchPlaceholder="Søk etter opptak..."
      isLoading={isLoading}
      actions={actions}
    />
  )
}
