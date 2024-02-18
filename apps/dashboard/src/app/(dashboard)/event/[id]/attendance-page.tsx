import { type AttendanceWithUser, type AttendeeUser, type UserIDP } from "@dotkomonline/types"
import { Box, Checkbox, NumberInput, Title, Text, Divider, Button, Flex } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import React, { useMemo, useState, type FC } from "react"
import { useEventDetailsContext } from "./provider"
import GenericSearch from "../../../../components/GenericSearch"
import { GenericTable } from "../../../../components/GenericTable"
import { useDeregisterForEventMutation } from "../../../../modules/event/mutations/use-deregister-for-event-mutation"
import { useRegisterForEventMutation } from "../../../../modules/event/mutations/use-register-for-event-mutation"
import { useUpdateEventAttendanceMutation } from "../../../../modules/event/mutations/use-update-event-attendance-mutation"
import { useEventAttendanceGetQuery } from "../../../../modules/event/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
import { notifyFail } from "../../../notifications"

const poolOverlaps = (pools: { min: number; max: number }[]): boolean =>
  pools.some((pool, i) => pools.some((otherPool, j) => i !== j && pool.min < otherPool.max && pool.max > otherPool.min))

const isConsecutive = (arr: number[]): boolean => arr.every((num, idx) => idx === 0 || num === arr[idx - 1] + 1)

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

const AttendanceTable = ({ attendance }: { attendance: AttendanceWithUser }) => {
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
    <Box key={attendance.id} mb="sm">
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
          Slett gruppe
        </Button>
      </Flex>
      <GenericTable table={table} />
    </Box>
  )
}

AttendanceTable.displayName = "AttendanceTable"

interface Year {
  0: boolean
  1: boolean
  2: boolean
  3: boolean
  4: boolean
  5: boolean
}

const YearForm = ({
  toAddNum,
  setToAddNum,
}: {
  toAddNum: Year
  setToAddNum: React.Dispatch<React.SetStateAction<Year>>
}) => (
  <table>
    {["sosialt", "1. klasse", "2. klasse", "3. klasse", "4. klasse", "5. klasse"].map((option, i) => (
      <tr key={option}>
        <td width="100">{option}</td>
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
)

export const EventAttendancePage: FC = () => {
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

  const handleUserSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleUserClick = async (user: UserIDP) => {
    setSearchQuery("")
    const dbUser = await dbUserMut.mutateAsync(user.subject)

    const userAlreadyRegistered = eventAttendance.some((pool) =>
      pool.attendees.some((attendee) => attendee.userId === dbUser?.id)
    )

    if (userAlreadyRegistered) {
      notifyFail({
        title: "Feil",
        message: "Brukeren er allerede påmeldt",
      })
      return
    }

    if (!dbUser) {
      notifyFail({
        title: "Feil",
        message: "Fant ikke brukeren i databasen",
      })

      return
    }
    const pool = eventAttendance.find((pool) => pool.min <= dbUser.studyYear && pool.max > dbUser.studyYear)

    if (!pool) {
      notifyFail({
        title: "Feil",
        message: "Fant ingen pool for brukeren",
      })
      return
    }

    registerForEvent.mutate({ poolId: pool.id, userId: dbUser.id.toString() })
  }

  const checkOverlaps = (min: number, max: number) => {
    const overlapsWithExistingPools = poolOverlaps([...eventAttendance, { min, max }])
    if (overlapsWithExistingPools) {
      throw new Error("Klassetrinnene overlapper med en eksisterende gruppe")
    }
  }

  const checkConsecutive = (chosenNumbers: number[]) => {
    // Can only choose consecutive numbers
    const sorted = chosenNumbers.sort((a, b) => a - b)
    if (!isConsecutive(sorted)) {
      throw new Error("Du kan ikke hoppe over klassetrinn")
    }
  }

  const checkNumber = (min: number, max: number) => {
    if (min === max) {
      // works because min is inclusive and max is exclusive, and both are -1 if no numbers are chosen
      throw new Error("Du må velge minst ett klassetrinn")
    }
  }

  const createNewGroup = () => {
    // check if there are gaps in toAddNum, i.e. [1, 3] is not allowed. but [1, 2, 3] is allowed. [3, 5] is not allowed, but [3, 4, 5] is allowed.
    const chosen = Object.entries(toAddNum)
      .filter(([, value]) => value)
      .map(([key]) => Number(key))

    const min = chosen.length ? Math.min(...chosen) : -1
    const max = chosen.length ? Math.max(...chosen) + 1 : -1

    try {
      checkNumber(min, max)
      checkConsecutive(chosen)
      checkOverlaps(min, max)
    } catch (e) {
      notifyFail({
        title: "Feil",
        message: (e as Error).message,
      })
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
      <Box>
        <Title order={3}>Lag ny gruppe</Title>
        <details>
          <summary
            style={{
              userSelect: "none",
            }}
          >
            Detaljer
          </summary>
          <Title order={5}>Velg klassetrinn</Title>
          <YearForm toAddNum={toAddNum} setToAddNum={setToAddNum} />
          <Title order={5}>Kapasitet</Title>
          <NumberInput value={limit} onChange={(value) => setLimit(Number(value))} />
          <Button onClick={() => createNewGroup()} mt={16}>
            Lag ny gruppe
          </Button>
        </details>
      </Box>
      <Divider my={16} />
      <Box>
        <Title order={3}>Meld på bruker</Title>
        <GenericSearch
          onSearch={handleUserSearch}
          onSubmit={handleUserClick}
          items={usersFromIdp}
          dataMapper={(item: UserIDP) => `${item.givenName} ${item.familyName}`}
          placeholder="Søk etter bruker..."
          resetOnClick
        />
      </Box>
      <Divider my={16} />
      <Box>
        <Title order={3} mt={16}>
          Grupper
        </Title>
        {eventAttendance.map((attendance) => (
          <AttendanceTable key={attendance.id} attendance={attendance} />
        ))}
      </Box>
    </Box>
  )
}
