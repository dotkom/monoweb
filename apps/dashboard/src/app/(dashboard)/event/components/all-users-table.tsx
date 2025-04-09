import type { AttendanceId, Attendee, AttendeeId } from "@dotkomonline/types"
import { Button, Checkbox } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { GenericTable } from "../../../../components/GenericTable"
import { useEventAttendeesGetQuery } from "../queries"

import { useDeregisterForEventMutation, useUpdateEventAttendanceMutation } from "../mutations"

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
      checked={defaultChecked}
    />
  )
}

interface AllAttendeesTableProps {
  attendanceId: AttendanceId
}
export const AllAttendeesTable = ({ attendanceId }: AllAttendeesTableProps) => {
  const deregisterMut = useDeregisterForEventMutation()

  const { attendees } = useEventAttendeesGetQuery(attendanceId)

  const columnHelper = createColumnHelper<Attendee>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((attendee) => attendee, {
        id: "userId",
        header: () => "Bruker",
        cell: (info) => {
          const attendee = info.getValue()
          return attendee.displayName
        },
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
    data: attendees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

AllAttendeesTable.displayName = "AllAttendeesTable"
