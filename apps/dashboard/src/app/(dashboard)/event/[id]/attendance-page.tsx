import { type AttendanceWithAuthData, type AttendeeWithAuthData, type IDPUser, type User } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import { Box, Checkbox, NumberInput, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { memo, useMemo, useState, type FC } from "react"
import { useEventDetailsContext } from "./provider"
import GenericSearch from "../../../../components/GenericSearch"
import { GenericTable } from "../../../../components/GenericTable"
import { useDeregisterForEventMutation } from "../../../../modules/event/mutations/use-deregister-for-event-mutation"
import { useRegisterForEventMutation } from "../../../../modules/event/mutations/use-register-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "../../../../modules/event/mutations/use-update-event-attendance-mutation"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { useQueryNotification } from "../../../notifications"

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

const AttendanceTable = ({ attendance }: { attendance: AttendanceWithAuthData }) => {
  const deregisterForEvent = useDeregisterForEventMutation()

  const deleteGroup = trpc.event.attendance.delete.useMutation()

  const ids = attendance.attendees.map((attendee) => attendee.userId)

  const au = trpc.user.getMany.useQuery(ids)

  const columnHelper = createColumnHelper<AttendeeWithAuthData & { user?: User }>()
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
      columnHelper.accessor("user.studyYear", {
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
            onClick={() =>
              deregisterForEvent.mutate({
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
    [columnHelper, deregisterForEvent]
  )

  const attendeesAndUsers = useMemo(
    () => attendance.attendees.map((attendee, i) => ({ ...attendee, user: au.data?.[i] })),
    [au.data] // TODO: if you include attendance here, it will cause an infinite render loop. users are never loaded on first render, so if users not in dep array, it will always be undefined.
  )

  const table = useReactTable({
    data: attendeesAndUsers,
    // data: attendance.attendees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const deleteGroup2 = () => {
    deleteGroup.mutate({
      id: attendance.id,
    })
  }

  return (
    <Box key={attendance.id} mb="sm">
      <Title order={4}>
        {attendance.id} Kapasitet: {attendance.attendees.length} / {attendance.limit} Klasse {attendance.min}-
        {attendance.max - 1}
        <Button onClick={() => deleteGroup2()}>Slett</Button>
      </Title>
      <GenericTable table={table} />
    </Box>
  )
}

AttendanceTable.displayName = "AttendanceTable"

export const EventAttendancePage: FC = () => {
  const notification = useQueryNotification()
  const { event } = useEventDetailsContext()
  const { eventAttendance } = useEventAttendanceGetQuery(event.id)
  const [searchQuery, setSearchQuery] = useState("")
  const registerForEvent = useRegisterForEventMutation()
  const dbUserMut = trpc.user.getBySubAsync.useMutation()
  const [toAddNum, setToAddNum] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })
  const { mutate: addAttendance } = trpc.event.attendance.create.useMutation()
  const [limit, setLimit] = useState(20)

  const { data: usersFromIdp = [] } = trpc.user.searchUsersFromIDP.useQuery(
    { searchQuery },
    {
      enabled: searchQuery.length > 1,
    }
  )

  console.log(usersFromIdp)

  const handleUserSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleUserClick = async (user: IDPUser) => {
    setSearchQuery("")
    const dbUser = await dbUserMut.mutateAsync(user.subject)
    if (!dbUser) {
      notification.fail({
        title: "Feil",
        message: "Fant ikke brukeren i databasen",
      })

      console.error("Fant ikke brukeren i databasen", user)
      return
    }
    const pool = eventAttendance.find((pool) => pool.min <= dbUser.studyYear && pool.max > dbUser.studyYear)

    if (!pool) {
      notification.fail({
        title: "Feil",
        message: "Fant ingen pool for brukeren",
      })
      console.error("Fant ingen pool for brukeren. Klassetrinn: ", dbUser.studyYear, "Pooler: ", eventAttendance)
      return
    }

    registerForEvent.mutate({ poolId: pool.id, userId: dbUser.id.toString(), cognitoSub: dbUser.cognitoSub })
  }

  const createNewGroup = () => {
    // check if there are gaps in toAddNum, i.e. [1, 3] is not allowed. but [1, 2, 3] is allowed. [3, 5] is not allowed, but [3, 4, 5] is allowed.
    const chosen = Object.entries(toAddNum)
      .filter(([, value]) => value)
      .map(([key]) => Number(key))

    const min = Math.min(...chosen)
    const max = Math.max(...chosen) + 1

    if (min === max) {
      notification.fail({
        title: "Feil",
        message: "Du må velge minst ett klassetrinn",
      })
      console.error("Feil, du må velge minst ett klassetrinn")
      return
    }

    const sorted = chosen.sort((a, b) => a - b)
    const isConsecutive = sorted.every((num, idx) => idx === 0 || num === sorted[idx - 1] + 1)

    if (!isConsecutive) {
      notification.fail({
        title: "Feil",
        message: "Du kan ikke hoppe over klassetrinn",
      })
      console.error("Feil, du kan ikke hoppe over klassetrinn")
      return
    }

    addAttendance({
      start: new Date(),
      end: new Date(),
      deregisterDeadline: new Date(),
      eventId: event.id,
      limit,
      min,
      max,
      attendees: [],
    })
  }

  return (
    <Box>
      <Title order={2}></Title>
      <details>
        <summary>Legg til ny gruppe</summary>
        <table>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <tr key={i}>
              <td>{i}</td>
              <td>
                <Checkbox
                  onChange={(e) => {
                    const newToAddNum = { ...toAddNum }
                    newToAddNum[i as keyof typeof newToAddNum] = e.currentTarget.checked
                    setToAddNum(newToAddNum)
                  }}
                />
              </td>
            </tr>
          ))}
        </table>
        <NumberInput value={limit} onChange={(value) => setLimit(Number(value))} />
        <Button onClick={() => createNewGroup()}>Lag ny gruppe</Button>
      </details>
      <Box>
        <Title order={3}>Meld på</Title>
        <GenericSearch
          onSearch={handleUserSearch}
          onSubmit={handleUserClick}
          items={usersFromIdp}
          dataMapper={(item: IDPUser) => `${item.givenName} ${item.familyName}`}
          placeholder="Søk etter bruker..."
        />
        {eventAttendance.map((attendance) => (
          <AttendanceTable key={attendance.id} attendance={attendance} />
        ))}
      </Box>
    </Box>
  )
}
