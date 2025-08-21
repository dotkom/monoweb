import type { Attendance, AttendancePool, Attendee } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { ActionIcon, Button, Checkbox, type CheckboxProps } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { isPast } from "date-fns"
import { useMemo } from "react"
import { FilterableTable, arrayOrEqualsFilter } from "src/components/molecules/FilterableTable/FilterableTable"
import { useUpdateAttendeeReservedMutation, useUpdateEventAttendanceMutation } from "../mutations"
import { openDeleteManualUserAttendModal } from "./manual-delete-user-attend-modal"

interface AllAttendeesTableProps {
  attendees: Attendee[]
  attendance: Attendance
}

const CheckboxXIcon: CheckboxProps["icon"] = ({ indeterminate, ...others }) =>
  indeterminate ? <IconX {...others} /> : <IconX {...others} />

export const AllAttendeesTable = ({ attendees, attendance }: AllAttendeesTableProps) => {
  const updateAttendanceMut = useUpdateEventAttendanceMutation()
  const updateAttendeeReservedMut = useUpdateAttendeeReservedMutation()

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
        .sort((a, b) => a.earliestReservationAt.getTime() - b.earliestReservationAt.getTime())

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
      columnHelper.accessor((attendee) => attendee.user.name, {
        id: "user",
        header: "Bruker",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("attendedAt", {
        header: "Møtt",
        filterFn: arrayOrEqualsFilter<Attendee>(),
        cell: (info) => {
          const row = info.row.original
          return (
            <Checkbox
              onChange={(event) => {
                updateAttendanceMut.mutate({ id: row.id, at: event.target.checked ? getCurrentUTC() : null })
              }}
              checked={info.getValue() !== null}
            />
          )
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Betaling",
        filterFn: arrayOrEqualsFilter<Attendee>(),
        cell: (info) => {
          const attendee = info.getValue()

          if (!attendance.attendancePrice) {
            return null
          }

          const hasPaid = Boolean(
            isPast(attendance.deregisterDeadline) ? attendee.paymentChargedAt : attendee.paymentReservedAt
          )
          return hasPaid ? (
            <Checkbox color="green" readOnly checked />
          ) : (
            <Checkbox icon={CheckboxXIcon} color="red" checked readOnly />
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
            size="sm"
            color="red"
            onClick={() => {
              openDeleteManualUserAttendModal({
                attendeeId: info.getValue().id,
                attendeeName: info.getValue().user.name || "bruker",
                poolName: pools[info.getValue().attendancePoolId]?.title ?? "gruppen",
              })
            }}
          >
            <IconX size={16} />
          </ActionIcon>
        ),
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "waitlistActions",
        enableSorting: false,
        header: () => "Endre status",
        cell: (info) =>
          info.getValue().reserved ? (
            <Button
              onClick={() => updateAttendeeReservedMut.mutate({ attendeeId: info.getValue().id, reserved: false })}
            >
              Flytt til venteliste
            </Button>
          ) : (
            <Button
              color="yellow"
              onClick={() => updateAttendeeReservedMut.mutate({ attendeeId: info.getValue().id, reserved: true })}
            >
              Flytt av venteliste
            </Button>
          ),
      }),
    ],
    [
      columnHelper,
      updateAttendanceMut,
      pools,
      waitlists,
      attendance.deregisterDeadline,
      attendance.attendancePrice,
      updateAttendeeReservedMut,
    ]
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
