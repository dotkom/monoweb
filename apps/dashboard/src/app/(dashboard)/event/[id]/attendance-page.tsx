import { type User, type Attendee } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import { Box, Checkbox, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useMemo, useState, type FC } from "react"
import GenericSearch from "src/components/GenericSearch"
import { GenericTable } from "src/components/GenericTable"
import { useDeregisterForEventMutation } from "src/modules/event/mutations/use-deregister-for-event-mutation"
import { useRegisterForEventMutation } from "src/modules/event/mutations/use-register-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "src/modules/event/mutations/use-update-event-attendance-mutation"
import { useEventAttendanceGetQuery } from "src/modules/event/queries/use-event-attendance-get-query"
import { useUserSearchQuery } from "src/modules/user/queries/use-user-search-query"
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
  const [searchQuery, setSearchQuery] = useState("")
  const { users } = useUserSearchQuery(searchQuery)
  const registerForEvent = useRegisterForEventMutation()
  const deregisterForEvent = useDeregisterForEventMutation()

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
      columnHelper.accessor((attendee) => attendee, {
        id: "deregsiter",
        header: () => "Meld av",
        cell: (info) => (
          <Button
            onClick={() =>
              deregisterForEvent.mutate({ attendanceId: info.getValue().attendanceId, userId: info.getValue().userId })
            }
          >
            X
          </Button>
        ),
      }),
    ],
    [columnHelper, deregisterForEvent]
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
    registerForEvent.mutate({ eventId: event.id, userId: user.id.toString() })
  }

  return (
    <Box>
      <Title order={3}>Meld på</Title>
      <GenericSearch
        onSearch={handleUserSearch}
        onSubmit={handleUserClick}
        items={users}
        dataMapper={(item: User) => item.id.toString()}
      />
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
