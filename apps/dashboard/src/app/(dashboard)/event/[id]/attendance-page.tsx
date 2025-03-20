import type { AttendanceDetails } from "@dotkomonline/types"
import { Box, Divider, Text, Title } from "@mantine/core"
import type { FC } from "react"
import { useAttendanceForm } from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import { PoolBox } from "../../../../modules/attendance/components/attendance-page/PoolsBox"
import { usePoolsForm } from "../../../../modules/attendance/components/attendance-page/PoolsForm"
import {
  useAddAttendanceMutation,
  useUpdateAttendanceMutation,
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
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
  attendance: AttendanceDetails
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
        {attendance.pools.length === 0 ? (
          <Text fs="italic">Ingen påmeldingsgrupper</Text>
        ) : (
          <PoolBox pools={attendance.pools} />
        )}
        <PoolsForm />
      </Box>
    </Box>
  )
}
