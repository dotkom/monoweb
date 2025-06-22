import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { ActionIcon, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

import type { QueryObserverResult } from "@tanstack/react-query"
import { FilterableTable, arrayOrEqualsFilter } from "src/components/molecules/FilterableTable/FilterableTable"
import { useDeregisterForEventMutation, useUpdateEventAttendanceMutation } from "../mutations"

interface AllAttendeesTableProps {
  attendees: Attendee[]
  attendance: Attendance
  refetch: () => Promise<QueryObserverResult<Attendee[], unknown>>
}

export const AllAttendeesTable = ({ attendees, attendance, refetch }: AllAttendeesTableProps) => {
  const deregisterMut = useDeregisterForEventMutation()
  const updateAttendanceMut = useUpdateEventAttendanceMutation()

  const pools = useMemo(() => {
    return (attendance?.pools ?? []).reduce<Record<string, AttendancePool>>((acc, pool) => {
      acc[pool.id] = pool
      return acc
    }, {})
  }, [attendance?.pools])

  const waitlists = useMemo(() => {
    return (attendance?.pools ?? []).reduce<Record<string, Record<string, number>>>((acc, pool) => {
      const waitlist = attendees
        .filter((a) => a.attendancePoolId === pool.id && !a.reserved)
        .sort((a, b) => a.reserveTime.getTime() - b.reserveTime.getTime())

      acc[pool.id] = waitlist.reduce<Record<string, number>>((map, attendee, idx) => {
        map[attendee.id] = idx + 1
        return map
      }, {})

      return acc
    }, {})
  }, [attendance?.pools, attendees])

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("user", {
        header: "Bruker",
        cell: (info) => info.getValue().displayName,
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
      columnHelper.accessor(
        (attendee) => {
          const spot = waitlists[attendee.attendancePoolId]?.[attendee.id]
          return spot ?? "-"
        },
        {
          id: "waitlistSpot",
          header: () => "Venteliste",
          cell: (info) => info.getValue(),
          filterFn: (row, columnId, filterValue) => {
            const value = row.getValue(columnId)
            const isEmpty = value === "-"

            const values = Array.isArray(filterValue) ? filterValue : [filterValue]

            if (values.includes(true) && values.includes(false)) return true
            if (values.includes(true)) return !isEmpty
            if (values.includes(false)) return isEmpty

            return false
          },
        }
      ),
      columnHelper.accessor((attendee) => pools[attendee.attendancePoolId]?.title ?? "", {
        id: "pool",
        header: () => "Påmeldingsgruppe",
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "deregister",
        enableSorting: false,
        header: () => "Meld av",
        cell: (info) => (
          <ActionIcon
            color="red"
            onClick={() =>
              deregisterMut.mutate(
                {
                  id: info.getValue().id,
                  reserveNextAttendee: true,
                },
                {
                  onSuccess: () => {
                    refetch()
                  },
                }
              )
            }
          >
            <Icon icon="tabler:x" />
          </ActionIcon>
        ),
      }),
    ],
    [columnHelper, deregisterMut, updateAttendanceMut, refetch, pools, waitlists]
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
        { columnId: "waitlistSpot", label: "På venteliste", value: true },
        { columnId: "waitlistSpot", label: "Ikke på venteliste", value: false },
      ]}
    />
  )
}

AllAttendeesTable.displayName = "AllAttendeesTable"
