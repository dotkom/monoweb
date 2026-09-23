"use client"

import { DateTooltip } from "@admin/components/DateTooltip"
import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { Badge, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"
import { type ApplicationPeriod, formatMinutesOfDay } from "./opptak"

const BooleanValue = ({ value }: { value: boolean }) => (
  <Badge color={value ? "blue" : "gray"} variant="default" className="font-mono">
    {String(value)}
  </Badge>
)

interface Props {
  applicationPeriods: ApplicationPeriod[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export const ApplicationTable = ({ applicationPeriods, isLoading, actions }: Props) => {
  const columnHelper = createColumnHelper<ApplicationPeriod>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        sortingFn: "alphanumeric",
        cell: (info) => <TextLink href={`/admin/opptak/${info.row.original.id}`}>{info.getValue()}</TextLink>,
      }),
      columnHelper.accessor("isDraft", {
        header: () => "Utkast",
        enableGlobalFilter: false,
        cell: (info) => <BooleanValue value={info.getValue()} />,
      }),
      columnHelper.accessor("applicationsStart", {
        header: () => "Søknadsstart",
        enableGlobalFilter: false,
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("applicationsEnd", {
        header: () => "Søknadsslutt",
        enableGlobalFilter: false,
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("interviewStartDate", {
        header: () => "Intervjustart",
        enableGlobalFilter: false,
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("interviewEndDate", {
        header: () => "Intervjuslutt",
        enableGlobalFilter: false,
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor(
        (period) => `${formatMinutesOfDay(period.dayStartMinutes)}–${formatMinutesOfDay(period.dayEndMinutes)}`,
        {
          id: "interviewDay",
          header: () => "Intervjudag",
          enableGlobalFilter: false,
          cell: (info) => info.getValue(),
        }
      ),
      columnHelper.accessor("isLocked", {
        header: () => "Stanset",
        enableGlobalFilter: false,
        cell: (info) => <BooleanValue value={info.getValue()} />,
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: applicationPeriods,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [applicationPeriods, columns]
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
