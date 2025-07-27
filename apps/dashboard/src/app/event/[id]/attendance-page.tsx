import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { useAttendanceForm } from "../components/attendance-form"
import { PoolBox } from "../components/pools-box"
import { usePoolsForm } from "../components/pools-form"
import { useAddAttendanceMutation, useUpdateAttendanceMutation } from "../mutations"
import { useEventContext } from "./provider"
import { useAttendanceGetQuery } from "@/app/event/queries"

export const AttendancePage: FC = () => {
  const event = useEventContext()
  const attendance = useAttendanceGetQuery(event.attendanceId as string, event.attendanceId !== null)
  if (event.attendanceId === null || attendance.isLoading || attendance.data === undefined) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <AttendancePageDetail attendance={attendance.data} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      selections: [],
    },
    label: "Opprett",
    onSubmit: (values) => {
      mutation.mutate({ eventId, values })
    },
  })

  return (
    <Box>
      <Title order={5}>Lag påmelding</Title>
      <AttendanceForm />
    </Box>
  )
}

interface EventAttendanceProps {
  attendance: Attendance
}
const AttendancePageDetail: FC<EventAttendanceProps> = ({ attendance }) => {
  const updateAttendanceMut = useUpdateAttendanceMutation()

  const AttendanceForm = useAttendanceForm({
    defaultValues: attendance,
    label: "Oppdater",
    onSubmit: (values) => {
      updateAttendanceMut.mutate({
        id: attendance.id,
        attendance: {
          registerStart: values.registerStart,
          registerEnd: values.registerEnd,
          deregisterDeadline: values.deregisterDeadline,
        },
      })
    },
  })

  const PoolsForm = usePoolsForm({
    attendanceId: attendance.id,
    pools: attendance.pools,
  })

  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Påmeldingstid
        </Title>
        <AttendanceForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title order={3}>Påmeldingsgrupper</Title>
        <PoolBox pools={attendance.pools || []} attendanceId={attendance.id} />
        <PoolsForm />
      </Box>
    </Box>
  )
}
