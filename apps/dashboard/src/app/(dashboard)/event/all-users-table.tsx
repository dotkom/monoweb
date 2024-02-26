import { Button, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useMemo } from "react"
import { type AttendeeWithUser, type AttendeeId } from "@dotkomonline/types"
import { GenericTable } from "../../../components/GenericTable"
import { useDeregisterForEventMutation } from "../../../modules/event/mutations/use-deregister-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "../../../modules/event/mutations/use-update-event-attendance-mutation"

interface CustomCheckboxProps {
  attendeeId: AttendeeId
  defaultChecked?: boolean
}
const CustomCheckbox = React.memo(({ attendeeId, defaultChecked }: CustomCheckboxProps) => {
  const updateAttendance = useUpdateEventAttendanceMutation()

  const toggleAttendance = (attendeeId: AttendeeId, currentCheckedState: boolean) => {
    updateAttendance.mutate({ id: attendeeId, attended: currentCheckedState })
  }
  return (
    <Checkbox
      onChange={(event) => {
        toggleAttendance(attendeeId, event.currentTarget.checked)
      }}
      defaultChecked={defaultChecked}
    />
  )
})

CustomCheckbox.displayName = "CustomCheckbox"

export const AllAttendeesTable = ({ users }: { users: AttendeeWithUser[] }) => {
  const deregisterMut = useDeregisterForEventMutation()

  const columnHelper = createColumnHelper<AttendeeWithUser>()
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
        cell: (info) => <CustomCheckbox attendeeId={info.getValue().id} defaultChecked={info.getValue().attended} />,
      }),
      columnHelper.accessor((attendee) => attendee, {
        id: "deregister",
        header: () => "Meld av",
        cell: (info) => (
          <Button
            color="red"
            onClick={() =>
              deregisterMut.mutate({
                id: info.getValue().id,
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
