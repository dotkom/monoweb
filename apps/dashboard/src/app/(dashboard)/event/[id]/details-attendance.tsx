import React, { FC, useMemo } from "react"
import { useEventDetailsContext } from "./provider"
import { Box, Title, Checkbox } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { GenericTable } from "src/components/GenericTable"
import { Attendee } from "@dotkomonline/types"

interface CustomCheckboxProps {
  userId: string
  attendanceId: string
  defaultChecked?: boolean
}
const CustomCheckbox = React.memo(({ attendanceId, userId, defaultChecked }: CustomCheckboxProps) => {
  const updateAttendance = useUpdateEventAttendanceMutation()
  console.log("rendering")

  const toggleAttendance = (userId: string, attendanceId: string, currentCheckedState: boolean) => {
    updateAttendance.mutate({ userId, attendanceId, attended: currentCheckedState })
  }
  return (
    <Checkbox
      onChange={(event) => {
        toggleAttendance(userId, attendanceId, event.currentTarget.checked)
      }}
      defaultChecked={defaultChecked}
    />
  )
})

export const EventDetailsAttendance: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("userId", {
        header: () => "Bruker",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "attended",
        header: () => "Møtt",
        cell: (info) => (
          <CustomCheckbox
            userId={info.getValue().userId}
            attendanceId={info.getValue().attendanceId}
            defaultChecked={info.getValue().attended}
          />
        ),
      }),
    ],
    [event, eventAttendance]
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
