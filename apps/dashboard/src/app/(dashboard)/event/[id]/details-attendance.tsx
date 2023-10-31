import React, { type FC, useMemo } from "react"
import { Box, Title, Checkbox } from "@mantine/core"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { type Attendee } from "@dotkomonline/types"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { GenericTable } from "src/components/GenericTable"
import { useEventDetailsContext } from "./provider"

interface CustomCheckboxProps {
  userId: string
  attendanceId: string
  defaultChecked?: boolean
}
const CustomCheckbox = React.memo(({ attendanceId, userId, defaultChecked }: CustomCheckboxProps) => {
  const updateAttendance = useUpdateEventAttendanceMutation()

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

CustomCheckbox.displayName = "attendanceToggle"

export const EventAttendancePage: FC = () => {
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
    [columnHelper]
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
            {attendance.id} {`(${attendance.attendees.length}/${attendance.limit})`}
          </Title>
          <GenericTable table={table} />
        </Box>
      ))}
    </Box>
  )
}
