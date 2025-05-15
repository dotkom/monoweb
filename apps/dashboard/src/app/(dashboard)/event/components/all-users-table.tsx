import type { Attendee } from "@dotkomonline/types"
import { Button, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

import type { QueryObserverResult } from "@tanstack/react-query"
import { FilterableTable, arrayOrEqualsFilter } from "src/components/molecules/FilterableTable/FilterableTable"
import { useDeregisterForEventMutation, useUpdateEventAttendanceMutation } from "../mutations"

interface AllAttendeesTableProps {
  attendees: Attendee[]
  refetch: () => Promise<QueryObserverResult<Attendee[], unknown>>
}

export const AllAttendeesTable = ({ attendees, refetch }: AllAttendeesTableProps) => {
  const deregisterMut = useDeregisterForEventMutation()
  const updateAttendanceMut = useUpdateEventAttendanceMutation()

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("displayName", {
        header: "Bruker",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("attended", {
        header: "Møtt",
        filterFn: arrayOrEqualsFilter<Attendee>(),
        cell: (info) => {
          const row = info.row.original
          return (
            <Checkbox
              onChange={(event) => {
                updateAttendanceMut.mutate(
                  { id: row.id, attended: event.currentTarget.checked },
                  { onSuccess: () => refetch() }
                )
              }}
              checked={info.getValue()}
            />
          )
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "deregister",
        enableSorting: false,
        header: () => "Meld av",
        cell: (info) => (
          <Button
            color="red"
            onClick={() =>
              deregisterMut.mutate(
                {
                  id: info.getValue().id,
                },
                {
                  onSuccess: () => {
                    refetch()
                  },
                }
              )
            }
          >
            X
          </Button>
        ),
      }),
    ],
    [columnHelper, deregisterMut, updateAttendanceMut, refetch]
  )

  const tableOptions = useMemo(
    () => ({
      data: attendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [attendees, columns]
  )

  return (
    <FilterableTable
      tableOptions={tableOptions}
      filters={[
        { columnId: "attended", label: "Møtt", value: true },
        { columnId: "attended", label: "Ikke møtt", value: false },
      ]}
    />
  )
}

AllAttendeesTable.displayName = "AllAttendeesTable"
