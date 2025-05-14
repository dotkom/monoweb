import type { AttendanceId, AttendancePool, Attendee } from "@dotkomonline/types"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { GenericTable } from "../../../../components/GenericTable"
import { useAttendanceGetQuery, useEventAttendeesGetQuery } from "../queries"

interface WaitlistTableProps {
  attendanceId: AttendanceId
}

export const WaitlistTable = ({ attendanceId }: WaitlistTableProps) => {
  const { attendees } = useEventAttendeesGetQuery(attendanceId)
  const { data: attandance } = useAttendanceGetQuery(attendanceId)

  const waitlistAttendees = useMemo(() => {
    return attendees.filter((a) => !a.reserved)
  }, [attendees])

  const pools = useMemo(() => {
    return (attandance?.pools ?? []).reduce<Record<string, AttendancePool>>((acc, pool) => {
      acc[pool.id] = pool
      return acc
    }, {})
  }, [attandance?.pools])

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((attendee) => attendee, {
        id: "userId",
        header: () => "Bruker",
        cell: (info) => {
          const attendee = info.getValue()
          return attendee.displayName
        },
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "pool",
        header: () => "Påmeldingsgruppe",
        cell: (info) => {
          const attendee = info.getValue()
          return pools[attendee.attendancePoolId]?.title ?? ""
        },
      }),
    ],
    [columnHelper, pools]
  )

  const table = useReactTable({
    data: waitlistAttendees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

WaitlistTable.displayName = "WaitlistTable"
