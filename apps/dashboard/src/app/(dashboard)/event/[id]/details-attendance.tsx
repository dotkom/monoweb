import React, { FC, useMemo, useState } from "react"
import { Box, Checkbox, Skeleton, Title } from "@mantine/core"
import { useReactTable, createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { Attendee } from "@dotkomonline/types"
import AttendanceQrReader from "src/components/qr-scanner/AttendanceQrReader"
import { GenericTable } from "src/components/GenericTable"
import { useEventDetailsContext } from "./provider"

interface CustomCheckboxProps {
  userId: string
  attendanceId: string
  attended?: boolean
}

const CustomCheckbox = React.memo(({ attendanceId, userId, attended }: CustomCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(attended)
  const updateEventAttendance = useUpdateEventAttendanceMutation()

  const handleCheckboxChange = async () => {
    setIsChecked(!isChecked)
    await updateEventAttendance.mutate({
      attendanceId,
      userId,
      attended: !isChecked,
    })
  }
  return <Checkbox onClick={handleCheckboxChange} checked={isChecked} />
})

CustomCheckbox.displayName = "attendanceToggle"

export const EventAttendancePage: FC = () => {
  const { event } = useEventDetailsContext()
  const { eventAttendance, isLoading } = useEventAttendanceGetQuery(event.id)

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(() => {
    return [
      columnHelper.accessor("userId", {
        header: () => "Bruker",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "attended",
        header: () => "Møtt",
        cell: (info) => (
          <CustomCheckbox
            key={info.getValue().userId}
            userId={info.getValue().userId}
            attendanceId={info.getValue().attendanceId}
            attended={info.getValue().attended}
          />
        ),
      }),
    ]
  }, [columnHelper])

  const data = useMemo(() => {
    const attendees = eventAttendance?.flatMap((attendance) => attendance.attendees) ?? []
    return attendees.sort((a, b) => a.userId.localeCompare(b.userId))
  }, [eventAttendance])

  const table = useReactTable({
    data: data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      <AttendanceQrReader />
      {eventAttendance?.map((attendance) => (
        <Skeleton key={attendance.id} mb="sm" visible={isLoading}>
          <Title order={4}>
            {attendance.id} {"(" + attendance.attendees.length + "/" + attendance.limit + ")"}
          </Title>
          <GenericTable table={table} />
        </Skeleton>
      ))}
    </Box>
  )
}
