import React, { FC, useMemo, useState } from "react"
import { useEventDetailsContext } from "./provider"
import { Box, Title, Checkbox } from "@mantine/core"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { GenericTable } from "src/components/GenericTable"
import { Attendee, User } from "@dotkomonline/types"
import { useUserSearchQuery } from "src/modules/user/queries/use-user-search-query"
import GenericSearch from "src/components/GenericSearch"

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
  const [searchQuery, setSearchQuery] = useState("")
  const { users } = useUserSearchQuery(searchQuery)

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
    data: useMemo(() => eventAttendance?.flatMap((attendance) => attendance.attendees) ?? [], [eventAttendance]),
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const handleUserSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleUserClick = (user: User) => {
    console.log(user)
  }

  return (
    <Box>
      <Title order={3}>Påmeldte</Title>
      <GenericSearch
        onSearch={handleUserSearch}
        onSubmit={handleUserClick}
        items={users}
        dataMapper={(item: User) => item.id.toString()}
      />
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
