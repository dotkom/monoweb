import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { InfoBox } from "../components/InfoBox"
import { useAttendanceForm } from "../components/attendance-form"
import { PoolBox } from "../components/pools-box"
import { usePoolsForm } from "../components/pools-form"
import { useAddAttendanceMutation, useUpdateAttendanceMutation } from "../mutations"
import { useEventDetailsContext } from "./provider"

export const AttendancePage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <AttendancePageDetail attendance={attendance} />
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
      mutation.mutate({ eventId, obj: values })
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
          Generelt
        </Title>
        <AttendanceForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title mb={10} order={3}>
          Reserverte plasser
        </Title>
        <InfoBox pools={attendance.pools || []} />
      </Box>
      <Box>
        <PoolsForm />
        <PoolBox pools={attendance.pools || []} attendanceId={attendance.id} />
      </Box>
    </Box>
  )
}
