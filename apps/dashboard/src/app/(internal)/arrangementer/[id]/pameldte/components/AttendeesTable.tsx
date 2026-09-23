import { FilterableDataTable, arrayOrEqualsFilter, dateSort } from "@/components/FilterableDataTable"
import type {
  Attendance,
  AttendancePool,
  Attendee,
  AttendeePaymentStatus,
  AttendeeSelectionResponse,
} from "@dotkomonline/rpc/attendance"
import { getAttendeePaymentStatus } from "@dotkomonline/rpc/attendance"
import type { FeedbackFormAnswer } from "@dotkomonline/rpc/feedback-form"
import {
  Badge,
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  TextLink,
  type BadgeColor,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowDown, IconArrowUp, IconX } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { formatDate, formatDistanceStrict, formatDistanceToNowStrict, isBefore } from "date-fns"
import { nb } from "date-fns/locale"
import { useMemo, useState } from "react"
import { ManualDeleteUserAttendModal } from "./ManualDeleteUserAttendModal"
import {
  useUpdateAttendeeReservedMutation,
  useUpdateEventAttendanceMutation,
} from "@/app/(internal)/arrangementer/mutations"

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

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
        <Text key={`${selectionId}-${optionId}`} className="text-sm">
          {getName(selectionId, optionId)}
        </Text>
      ))}
    </div>
  )
}

interface AttendeesTableProps {
  attendees: Attendee[]
  attendance: Attendance
  feedbackAnswers?: FeedbackFormAnswer[]
  canEdit?: boolean
}

export const AttendeesTable = ({ attendees, attendance, feedbackAnswers, canEdit = true }: AttendeesTableProps) => {
  const [deleteTarget, setDeleteTarget] = useState<{
    attendeeId: string
    attendeeName: string
    poolName: string
  } | null>(null)
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

  const sortedAttendees = useMemo(() => {
    const poolOrder = new Map((attendance?.pools ?? []).map((pool, index) => [pool.id, index]))

    return attendees.toSorted((a, b) => {
      const poolDiff = (poolOrder.get(a.attendancePoolId) ?? 0) - (poolOrder.get(b.attendancePoolId) ?? 0)
      if (poolDiff !== 0) {
        return poolDiff
      }

      const aSpot = waitlists[a.attendancePoolId]?.[a.id] ?? null
      const bSpot = waitlists[b.attendancePoolId]?.[b.id] ?? null

      if (aSpot === null && bSpot === null) {
        return a.earliestReservationAt.getTime() - b.earliestReservationAt.getTime()
      }
      if (aSpot === null) {
        return -1
      }
      if (bSpot === null) {
        return 1
      }

      return aSpot - bSpot
    })
  }, [attendees, attendance?.pools, waitlists])

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

          const afterRegisterStart = formatDistanceStrict(earliestReservationAt, attendance.registerStart, {
            locale: nb,
          })
          const relativeAfterRegisterStart = formatDistanceToNowStrict(earliestReservationAt, { locale: nb })

          const fullLocale = "EEEE dd. MMM yyyy 'kl.' HH:mm:ss.SSS O"
          const fullEarliestReservationAt = formatDate(earliestReservationAt, fullLocale, { locale: nb })
          const fullCreatedAt = formatDate(createdAt, fullLocale, { locale: nb })

          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" className="h-auto p-0">
                  <div className="flex flex-col items-start gap-0">
                    {isBefore(earliestReservationAt, attendance.registerStart) ? (
                      <>
                        <Text className="text-sm">Forhåndspåmeldt</Text>
                        <Text className="text-xs">{capitalize(afterRegisterStart)} fp.</Text>
                      </>
                    ) : (
                      <>
                        <Text className="text-sm">{capitalize(afterRegisterStart)} ep.</Text>
                        <Text className="text-xs">({capitalize(relativeAfterRegisterStart)} siden)</Text>
                      </>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-0">
                    <Text className="text-sm">Utregnet påmeldingstidspunkt (inkl. prikker og utsettelser):</Text>
                    <Text className="text-lg">{capitalize(fullEarliestReservationAt)}</Text>
                  </div>
                  <Text className="text-sm">Faktisk påmeldingstidspunkt: {fullCreatedAt}</Text>
                </div>
              </PopoverContent>
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
            <TextLink href={`/brukere/${user.id}`} className="text-sm">
              {user.name || user.id}
            </TextLink>
          )
        },
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("attendedAt", {
        header: "Møtt",
        sortingFn: dateSort(),
        enableSorting: true,
        enableMultiSort: false,
        filterFn: (row, columnId, filterValue) => {
          const attended = row.getValue<Date | null>(columnId) !== null
          const selected = Array.isArray(filterValue) ? filterValue : [filterValue]
          return selected.includes(attended)
        },
        cell: (info) => {
          const row = info.row.original
          const date = info.getValue()
          return (
            <div className="flex flex-col gap-0">
              <Checkbox
                onCheckedChange={(checked) => {
                  updateAttendanceMut.mutate({ id: row.id, at: checked === true ? getCurrentUTC() : null })
                }}
                checked={date !== null}
                disabled={!canEdit}
              />
              <Text className="text-[10px]">{date !== null ? formatDate(date, "dd.MM.yyyy") : "Ikke møtt"}</Text>
              {date !== null && <Text className="text-[10px]">{formatDate(date, "'kl.' HH:mm")}</Text>}
            </div>
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

          const paymentStatusBadge: Record<AttendeePaymentStatus, { color: BadgeColor; children: string }> = {
            refunded: { color: "gray", children: "Refundert" },
            charged: { color: "green", children: "Betalt" },
            reserved: { color: "blue", children: "Reservert" },
            cancelled: { color: "gray", children: "Kansellert" },
            pending: { color: "red", children: "Ikke betalt" },
            none: { color: "red", children: "Ikke betalt" },
          }

          const badge = paymentStatusBadge[getAttendeePaymentStatus(attendee)]
          return <Badge color={badge.color}>{badge.children}</Badge>
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        header: "Tilbakemelding",
        filterFn: arrayOrEqualsFilter<Attendee>(),
        cell: (info) => {
          if (!feedbackAnswers) {
            return <Text className="text-[10px]">Ingen tilbakemeldingsskjema</Text>
          }

          const attendee = info.getValue()
          const feedback = feedbackAnswers?.find((answer) => answer.attendeeId === attendee.id)
          const date = feedback?.createdAt
          return (
            <div className="flex flex-col gap-0">
              <Checkbox readOnly checked={Boolean(feedback)} />
              <Text className="text-[10px]">{date !== undefined ? formatDate(date, "dd.MM.yyyy") : "Ikke gitt"}</Text>
              {date !== undefined && <Text className="text-[10px]">{formatDate(date, "'kl.' HH:mm")}</Text>}
            </div>
          )
        },
      }),
      columnHelper.accessor((attendee) => waitlists[attendee.attendancePoolId]?.[attendee.id] ?? null, {
        id: "waitlistSpot",
        header: () => "Venteliste",
        filterFn: (row, columnId, filterValue) => {
          const onWaitlist = row.getValue<number | null>(columnId) !== null
          const selected = Array.isArray(filterValue) ? filterValue : [filterValue]
          return selected.includes(onWaitlist)
        },
        cell: (info) => {
          const attendee = info.row.original
          const queuePosition = info.getValue() as number | null

          const ArrowIcon = queuePosition ? IconArrowUp : IconArrowDown

          return (
            <div className="flex flex-col gap-1">
              <Badge color={queuePosition ? "red" : "gray"} variant={queuePosition ? "default" : "outline"}>
                {queuePosition ? `Plass ${queuePosition}` : "Nei"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-fit w-fit p-0.5"
                disabled={!canEdit}
                icon={<ArrowIcon size={12} />}
                onClick={() =>
                  updateAttendeeReservedMut.mutate({ attendeeId: attendee.id, reserved: queuePosition !== null })
                }
              >
                <Text className="text-xs">{queuePosition ? "Påmeld" : "Til kø"}</Text>
              </Button>
            </div>
          )
        },
      }),
      columnHelper.accessor((attendee) => pools[attendee.attendancePoolId]?.title ?? "", {
        id: "pool",
        header: () => "Påmeldingsgruppe",
        sortingFn: "alphanumeric",
        enableGlobalFilter: false,
      }),
      columnHelper.accessor("selections", {
        id: "selections",
        enableSorting: false,
        enableGlobalFilter: false,
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
        enableGlobalFilter: false,
        header: () => "Matpreferanser",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "deregister",
        enableSorting: false,
        enableGlobalFilter: false,
        header: () => "Meld av",
        cell: (info) => (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={!canEdit}
            onClick={() => {
              setDeleteTarget({
                attendeeId: info.getValue().id,
                attendeeName: info.getValue().user.name || "bruker",
                poolName: pools[info.getValue().attendancePoolId]?.title ?? "gruppen",
              })
            }}
          >
            <IconX size={16} />
          </Button>
        ),
      }),
    ],
    [
      columnHelper,
      updateAttendanceMut,
      pools,
      waitlists,
      updateAttendeeReservedMut,
      attendance,
      feedbackAnswers,
      canEdit,
    ]
  )

  const tableOptions = useMemo(
    () => ({
      data: sortedAttendees,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [sortedAttendees, columns]
  )

  return (
    <>
      <FilterableDataTable
        tableOptions={tableOptions}
        filters={[
          { columnId: "attendedAt", label: "Møtt", value: true },
          { columnId: "attendedAt", label: "Ikke møtt", value: false },
          { columnId: "waitlistSpot", label: "På venteliste", value: true },
          { columnId: "waitlistSpot", label: "Ikke på venteliste", value: false },
        ]}
      />
      {deleteTarget && (
        <ManualDeleteUserAttendModal
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTarget(null)
            }
          }}
          attendeeId={deleteTarget.attendeeId}
          attendeeName={deleteTarget.attendeeName}
          poolName={deleteTarget.poolName}
        />
      )}
    </>
  )
}
