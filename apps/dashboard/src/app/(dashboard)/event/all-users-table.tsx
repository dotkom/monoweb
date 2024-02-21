import { Button, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useMemo } from "react"
import { GenericTable } from "../../../components/GenericTable"
import { useDeregisterForEventMutation } from "../../../modules/event/mutations/use-deregister-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "../../../modules/event/mutations/use-update-event-attendance-mutation"

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

CustomCheckbox.displayName = "CustomCheckbox"

interface User {
  givenName: string
  familyName: string
  studyYear: number
  userId: string
  attendanceId: string
  attended: boolean
}

export const AllAttendeesTable = ({ users }: { users: User[] }) => {
  const deregisterMut = useDeregisterForEventMutation()

  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((attendee) => attendee, {
        id: "userId",
        header: () => "Bruker",
        cell: (info) => {
          const user = info.getValue()
          return `${user.givenName} ${user.familyName}`
        },
      }),
      columnHelper.accessor("studyYear", {
        header: () => "Klassetrinn",
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "attend",
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
        id: "deregister",
        header: () => "Meld av",
        cell: (info) => (
          <Button
            color="red"
            onClick={() =>
              deregisterMut.mutate({
                attendanceId: info.getValue().attendanceId,
                userId: info.getValue().userId,
              })
            }
          >
            X
          </Button>
        ),
      }),
    ],
    [columnHelper, deregisterMut]
  )

  const table = useReactTable({
    data: users,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

AllAttendeesTable.displayName = "AllAttendeesTable"
