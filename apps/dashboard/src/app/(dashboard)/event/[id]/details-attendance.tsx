import React, { FC, useMemo, useState } from "react"
import { useEventDetailsContext } from "./provider"
import { Box, Title, Checkbox, Button, Skeleton } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { GenericTable } from "src/components/GenericTable"
import { Attendee } from "@dotkomonline/types"
import AttendanceQrReader from "src/components/qr-scanner/AttendanceQrReader"

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
  console.log("rerendering")
  const { event } = useEventDetailsContext()
  const { eventAttendance, isLoading, refetch } = useEventAttendanceGetQuery(event.id)

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
    [eventAttendance]
  )

  const data = useMemo(() => eventAttendance?.flatMap((attendance) => attendance.attendees) ?? [], [isLoading])

  const table = useReactTable({
    data: data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      <AttendanceQrReader refetch={refetch} />
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
