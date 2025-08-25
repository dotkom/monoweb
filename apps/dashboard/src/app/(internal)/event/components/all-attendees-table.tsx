import type { Attendance, AttendancePool, Attendee, AttendeeSelectionResponse } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { ActionIcon, Anchor, Button, Checkbox, Group, Text } from "@mantine/core"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"
import { IconX } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { isPast } from "date-fns"
import { useMemo } from "react"
import { FilterableTable, arrayOrEqualsFilter } from "src/components/molecules/FilterableTable/FilterableTable"
import { useUpdateAttendeeReservedMutation, useUpdateEventAttendanceMutation } from "../mutations"
import { openDeleteManualUserAttendModal } from "./manual-delete-user-attend-modal"

const Selections = ({
  attendance,
  attendeeSelections,
}: { attendance: Attendance; attendeeSelections: AttendeeSelectionResponse[] }) => {
  const getName = (selectionId: string, optionId: string) =>
    attendance.selections
      .find((selection) => selection.id === selectionId)
      ?.options.find((option) => option.id === optionId)?.name || "Ukjent"

  return (
    <div className="flex flex-col-1 gap-0">
      {attendeeSelections.map(({ selectionId, optionId }) => (
        <Text key={`${selectionId}-${optionId}`} size="sm">
          {getName(selectionId, optionId)}
        </Text>
      ))}
    </div>
  )
}

interface AllAttendeesTableProps {
  attendees: Attendee[]
  attendance: Attendance
}

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
        cell: (info) => {
          const user = info.row.original.user
          return (
            <Anchor size="sm" href={`/user/${user.id}`}>
              {user.name || user.id}
            </Anchor>
          )
        },
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

          const wasRefunded = Boolean(attendee.paymentRefundedById)
          const hasPaid = Boolean(
            isPast(attendance.deregisterDeadline) ? attendee.paymentChargedAt : attendee.paymentReservedAt
          )

          return hasPaid ? (
            <Checkbox color="green" readOnly checked />
          ) : wasRefunded ? (
            <Group gap={4}>
              <Checkbox color="gray" indeterminate readOnly />
              <Text size="xs" c="gray">
                Refundert
              </Text>
            </Group>
          ) : (
            <Checkbox icon={({ className }) => <IconX className={className} />} color="red" checked readOnly />
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
      columnHelper.accessor("selections", {
        id: "selections",
        enableSorting: false,
        header: () => "Valg",
        cell: (info) => {
          const selections = info.getValue()

          if (!selections.length) {
            return "-"
          }

          return <Selections attendance={attendance} attendeeSelections={info.getValue()} />
        },
      }),
      columnHelper.accessor("user.dietaryRestrictions", {
        id: "dietaryRestrictions",
        enableSorting: false,
        header: () => "Matpreferanser",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "waitlistActions",
        enableSorting: false,
        header: () => "Endre køstatus",
        cell: (info) =>
          info.getValue().reserved ? (
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<IconArrowDown size={14} />}
              onClick={() => updateAttendeeReservedMut.mutate({ attendeeId: info.getValue().id, reserved: false })}
            >
              Send til kø
            </Button>
          ) : (
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<IconArrowUp size={14} />}
              onClick={() => updateAttendeeReservedMut.mutate({ attendeeId: info.getValue().id, reserved: true })}
            >
              Påmeld
            </Button>
          ),
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
    ],
    [columnHelper, updateAttendanceMut, pools, waitlists, updateAttendeeReservedMut, attendance]
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
