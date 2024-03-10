import { type AttendeeUser, type AttendeeId, AttendanceId } from "@dotkomonline/types"
import { Button, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useMemo } from "react"
import { GenericTable } from "../../../components/GenericTable"
import {
  useDeregisterForEventMutation,
  useUpdateEventAttendanceMutation,
} from "../../../modules/attendance/mutations/use-attendee-mutations"

interface CustomCheckboxProps {
  attendeeId: AttendeeId
  defaultChecked?: boolean
}
  const CustomCheckbox = ({ attendeeId, defaultChecked }: CustomCheckboxProps) => {
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
}

export const AllAttendeesTable = ({ users, attendanceId }: { users: AttendeeUser[], attendanceId: AttendanceId }) => {
  const deregisterMut = useDeregisterForEventMutation()

  const columnHelper = createColumnHelper<AttendeeUser>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((attendee) => attendee, {
        id: "userId",
        header: () => "Bruker",
        cell: (info) => {
          const attendee = info.getValue()
          // return `${attendee.user.givenName} ${attendee.user.familyName}`
          return `${attendee.user.name}`
        },
      }),
      columnHelper.accessor("user.studyYear", {
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
                attendanceId: attendanceId
              })
            }
          >
            X
          </Button>
        ),
      }),
    ],
    [columnHelper, deregisterMut, attendanceId]
  )

  const table = useReactTable({
    data: users,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

AllAttendeesTable.displayName = "AllAttendeesTable"
