"use client"

import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import {
  type ApplicantInterview,
  DateCell,
  InterviewAttendees,
  InterviewLocation,
  TextCell,
} from "../../../components/Cells"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

export type ApplicantRow = {
  applicationId: string
  name: string
  committees?: string[]
  interview?: ApplicantInterview | null
}

const columnHelper = createColumnHelper<ApplicantRow>()

interface ApplicantTableProps {
  rows: ApplicantRow[]
  getHref: (applicant: ApplicantRow) => string
  showCommittees?: boolean
  isLoading?: boolean
}

export const ApplicantTable = ({ rows, getHref, showCommittees, isLoading }: ApplicantTableProps) => {
  const router = useRouter()

  const columns = useMemo(() => {
    const nameColumn = columnHelper.accessor("name", {
      header: () => "Søker",
      sortingFn: "alphanumeric",
      cell: (info) => <TextLink href={getHref(info.row.original)}>{info.getValue()}</TextLink>,
    })

    if (showCommittees) {
      return [
        nameColumn,
        columnHelper.accessor((applicant) => (applicant.committees ?? []).join(", "), {
          id: "committees",
          header: () => "Komitéer søkt",
          cell: (info) => <TextCell value={info.getValue()} emptyLabel="Ingen komitéer" />,
        }),
      ]
    }

    return [
      nameColumn,
      columnHelper.accessor((applicant) => applicant.interview?.locationName ?? null, {
        id: "location",
        header: () => "Rom",
        cell: (info) => <InterviewLocation interview={info.row.original.interview} />,
      }),
      columnHelper.accessor(
        (applicant) => (applicant.interview?.attendees ?? []).map((attendee) => attendee.name).join(", "),
        {
          id: "attendees",
          header: () => "Deltagere",
          cell: (info) => <InterviewAttendees attendees={info.row.original.interview?.attendees ?? []} />,
        }
      ),
      columnHelper.accessor((applicant) => applicant.interview?.startsAt ?? null, {
        id: "interview",
        header: () => "Tidspunkt",
        cell: (info) => <DateCell date={info.getValue()} emptyLabel="Ikke satt opp" />,
      }),
    ]
  }, [getHref, showCommittees])

  const tableOptions = useMemo(
    () => ({
      data: rows,
      getRowId: (applicant: ApplicantRow) => applicant.applicationId,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [rows, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      searchPlaceholder="Søk etter søker..."
      isLoading={isLoading}
      initialSorting={[{ id: showCommittees ? "name" : "interview", desc: false }]}
      onRowClick={(row) => router.push(getHref(row.original))}
    />
  )
}
