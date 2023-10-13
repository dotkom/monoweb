import { FC, useState, useMemo, useCallback } from "react"
import { useEventDetailsContext } from "./provider"
import { Box, Title, Checkbox } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { GenericTable } from "src/components/GenericTable"
import { Attendee } from "@dotkomonline/types"

export const EventDetailsAttendance: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const updateAttendance = useUpdateEventAttendanceMutation()

  const [localAttended, setLocalAttended] = useState<{ [key: string]: boolean }>({})

  const toggleAttendance = (userId: string, attendanceId: string, attended: boolean) => {
    updateAttendance.mutate(
      { userId, attendanceId, attended: !attended },
      {
        onSuccess: (data) => {
          setLocalAttended((prev) => ({ ...prev, [userId]: data.attended }))
        },
      }
    )
  }

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("userId", {
        header: () => "Bruker",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "attended",
        header: () => "Møtt",
        cell: (info) => {
          const attendee = info.getValue()
          return (
            <Checkbox
              defaultChecked={localAttended[attendee.userId] ?? attendee.attended}
              onChange={() =>
                toggleAttendance(
                  attendee.userId,
                  attendee.attendanceId,
                  localAttended[attendee.userId] ?? attendee.attended
                )
              }
            />
          )
        },
      }),
    ],
    [localAttended]
  )

  const table = useReactTable({
    data: eventAttendance?.flatMap((attendance) => attendance.attendees) ?? [],
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      {eventAttendance?.map((attendance) => (
        <Box key={attendance.id} mb="sm">
          <Title order={4}>
            {attendance.id} {"(" + attendance.attendees.length + "/" + attendance.limit + ")"}
          </Title>
          <GenericTable table={table} />
        </Box>
      ))}
    </Box>
  )
}
