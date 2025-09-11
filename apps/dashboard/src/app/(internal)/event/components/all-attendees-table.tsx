import type { Attendance, AttendancePool, Attendee, AttendeeSelectionResponse } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Stack,
  Text,
} from "@mantine/core"
import { IconArrowDown, IconArrowUp, IconX } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { formatDate, formatDistanceStrict, formatDistanceToNowStrict, isPast } from "date-fns"
import { nb } from "date-fns/locale"
import { useMemo } from "react"
import {
  FilterableTable,
  arrayOrEqualsFilter,
  dateSort,
} from "src/components/molecules/FilterableTable/FilterableTable"
import { useUpdateAttendeeReservedMutation, useUpdateEventAttendanceMutation } from "../mutations"
import { openDeleteManualUserAttendModal } from "./manual-delete-user-attend-modal"

interface RenderSelectionsProps {
  attendance: Attendance
  attendeeSelections: AttendeeSelectionResponse[]
}

const RenderSelections = ({ attendance, attendeeSelections }: RenderSelectionsProps) => {
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
      columnHelper.accessor("earliestReservationAt", {
        header: "Påmeldingstid",
        sortingFn: dateSort(),
        sortDescFirst: false,
        enableSorting: true,
        enableMultiSort: false,
        cell: (info) => {
          const earliestReservationAt = info.getValue()
          const createdAt = info.row.original.createdAt
          return (
            <Popover>
              <PopoverTarget>
                <Button variant="transparent" p={0}>
                  <Stack gap={0} align="flex-start">
                    <Text size="sm">
                      {formatDistanceStrict(earliestReservationAt, attendance.registerStart, { locale: nb })} ep.
                    </Text>
                    <Text size="xs">({formatDistanceToNowStrict(earliestReservationAt, { locale: nb })} siden)</Text>
                  </Stack>
                </Button>
              </PopoverTarget>
              <PopoverDropdown>
                <Stack>
                  <Stack gap={0}>
                    <Text size="sm">Utregnet påmeldingstidspunkt (inkl. prikker og utsettelser):</Text>
                    <Text size="lg">
                      {formatDate(earliestReservationAt, "EEEE dd. MMM yyyy 'kl.' HH:mm:ss.SSS O", { locale: nb })}
                    </Text>
                  </Stack>
                  <Text size="sm">
                    Faktisk påmeldingstidspunkt:{" "}
                    {formatDate(createdAt, "EEEE dd. MMM yyyy 'kl.' HH:mm:ss.SSS O", { locale: nb })}
                  </Text>
                </Stack>
              </PopoverDropdown>
            </Popover>
          )
        },
      }),
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
        sortingFn: dateSort(),
        sortDescFirst: false,
        enableSorting: true,
        enableMultiSort: false,
        cell: (info) => {
          const row = info.row.original
          const date = info.getValue()
          return (
            <Stack gap={0}>
              <Checkbox
                onChange={(event) => {
                  updateAttendanceMut.mutate({ id: row.id, at: event.target.checked ? getCurrentUTC() : null })
                }}
                checked={date !== null}
              />
              <Text style={{ fontSize: "10px" }}>{date !== null ? formatDate(date, "dd.MM.yyyy") : "Ikke møtt"}</Text>
              {date !== null && <Text style={{ fontSize: "10px" }}>{formatDate(date, "'kl.' HH:mm")}</Text>}
            </Stack>
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
      columnHelper.accessor((attendee) => waitlists[attendee.attendancePoolId]?.[attendee.id] ?? null, {
        id: "waitlistSpot",
        header: () => "Venteliste",
        cell: (info) => {
          const attendee = info.row.original
          const queuePosition = info.getValue() as number | null

          const ArrowIcon = queuePosition ? IconArrowUp : IconArrowDown

          return (
            <Stack gap={4}>
              <Badge color={queuePosition ? "red" : "gray"} variant={queuePosition ? "filled" : "outline"}>
                {queuePosition ? `Plass ${queuePosition}` : "Nei"}
              </Badge>
              <Button
                variant="subtle"
                size="compact-xs"
                p={2}
                onClick={() =>
                  updateAttendeeReservedMut.mutate({ attendeeId: attendee.id, reserved: queuePosition !== null })
                }
                leftSection={<ArrowIcon size={12} />}
                styles={{
                  section: { marginRight: "3px" },
                  root: { height: "fit-content", width: "fit-content" },
                  inner: { justifyContent: "flex-start" },
                }}
              >
                <Text size="xs">{queuePosition ? "Påmeld" : "Til kø"}</Text>
              </Button>
            </Stack>
          )
        },
      }),
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

          return <RenderSelections attendance={attendance} attendeeSelections={info.getValue()} />
        },
      }),
      columnHelper.accessor("user.dietaryRestrictions", {
        id: "dietaryRestrictions",
        enableSorting: false,
        header: () => "Matpreferanser",
        cell: (info) => info.getValue() || "-",
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
