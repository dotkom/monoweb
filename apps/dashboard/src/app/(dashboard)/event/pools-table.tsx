import { type AttendanceWithUser, type AttendeeUser } from "@dotkomonline/types"
import { Checkbox, Button, Box, Flex, Text } from "@mantine/core"
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table"
import React, { useMemo } from "react"
import { GenericTable } from "../../../components/GenericTable"
import { useDeregisterForEventMutation } from "../../../modules/event/mutations/use-deregister-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "../../../modules/event/mutations/use-update-event-attendance-mutation"
import { trpc } from "../../../utils/trpc"
import { notifyFail } from "../../notifications"

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

export const PoolsTable = ({ attendance }: { attendance: AttendanceWithUser }) => {
  const deregisterMut = useDeregisterForEventMutation()
  const deleteGroupMut = trpc.event.attendance.delete.useMutation()

  const columnHelper = createColumnHelper<AttendeeUser>()
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
    data: attendance.attendees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const deleteGroup = () => {
    if (attendance.attendees.length > 0) {
      notifyFail({
        title: "Feil",
        message: "Gruppen har deltakere, og kan ikke slettes",
      })
      return
    }

    deleteGroupMut.mutate({
      id: attendance.id,
    })
  }

  return (
    <Box>
      <Flex justify="space-between">
        <Box>
          <Text>
            Klasse {attendance.min}- {attendance.max - 1}
          </Text>
          <Text>
            Kapasitet: {attendance.attendees.length} / {attendance.limit}
          </Text>
        </Box>

        <Button onClick={() => deleteGroup()} color="red">
          Slett pulje
        </Button>
      </Flex>
      <GenericTable table={table} />
    </Box>
  )
}

PoolsTable.displayName = "PoolsTable"
