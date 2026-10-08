"use client"

import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { Badge, type BadgeColor, Text } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { useMemo } from "react"
import { type Committee, type CommitteeAvailability, getAvailabilityHours } from "../committees"

export interface CommitteeStatusRow extends Committee {
  availability: CommitteeAvailability
}

type CommitteeStatus = "SUBMITTED" | "PENDING"

const STATUS_LABELS: Record<CommitteeStatus, string> = {
  SUBMITTED: "Ferdig",
  PENDING: "Ikke ferdig",
}

const STATUS_COLORS: Record<CommitteeStatus, BadgeColor> = {
  SUBMITTED: "green",
  PENDING: "gray",
}

const getCommitteeStatus = (availability: CommitteeAvailability): CommitteeStatus =>
  availability.submittedAt !== null ? "SUBMITTED" : "PENDING"

const formatHours = (hours: number) => `${hours.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} t`

const EmptyValue = () => <Text className="text-sm text-muted-foreground">—</Text>

export type CommitteeStatusTableProps = {
  rows: CommitteeStatusRow[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export const CommitteeStatusTable = ({ rows, isLoading, actions }: CommitteeStatusTableProps) => {
  const columnHelper = createColumnHelper<CommitteeStatusRow>()

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Komité",
        sortingFn: "alphanumeric",
        cell: (info) => <Text className="text-sm">{info.getValue()}</Text>,
      }),
      columnHelper.accessor((row) => STATUS_LABELS[getCommitteeStatus(row.availability)], {
        id: "status",
        header: () => "Status",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Badge color={STATUS_COLORS[getCommitteeStatus(info.row.original.availability)]} variant="default">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => getAvailabilityHours(row.availability), {
        id: "totalHours",
        header: () => "Totalt antall timer",
        enableGlobalFilter: false,
        cell: (info) => <Text className="text-sm tabular-nums">{formatHours(info.getValue())}</Text>,
      }),
      columnHelper.accessor((row) => row.availability.updatedBy, {
        id: "updatedBy",
        header: () => "Sist endret av",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const updatedBy = info.getValue()

          return updatedBy === null ? <EmptyValue /> : <Text className="text-sm">{updatedBy}</Text>
        },
      }),
      columnHelper.accessor((row) => row.availability.submittedAt, {
        id: "submittedAt",
        header: () => "Sendt inn",
        enableGlobalFilter: false,
        cell: (info) => {
          const submittedAt = info.getValue()

          return submittedAt === null ? (
            <EmptyValue />
          ) : (
            <Text className="text-sm tabular-nums">
              {formatDate(submittedAt, "dd. MMM yyyy HH:mm", { locale: nb })}
            </Text>
          )
        },
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: rows,
      getRowId: (row: CommitteeStatusRow) => row.slug,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [rows, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      searchPlaceholder="Søk etter komité..."
      isLoading={isLoading}
      actions={actions}
    />
  )
}
