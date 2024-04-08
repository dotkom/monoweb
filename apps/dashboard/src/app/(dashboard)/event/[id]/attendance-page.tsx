import type { Attendance } from "@dotkomonline/types"
import { Box, Divider, Title } from "@mantine/core"
import type { FC } from "react"
import { useAttendanceForm } from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import { InfoBox } from "../../../../modules/attendance/components/attendance-page/InfoBox"
import { PoolBox } from "../../../../modules/attendance/components/attendance-page/PoolsBox"
import { usePoolsForm } from "../../../../modules/attendance/components/attendance-page/PoolsForm"
import {
  useAddAttendanceMutation,
  useUpdateAttendanceMutation,
} from "../../../../modules/attendance/mutations/use-attendance-mutations"
import { usePoolsGetQuery } from "../../../../modules/attendance/queries/use-get-queries"
import { useEventDetailsContext } from "./provider"

export const AttendancePage: FC = () => {
  const { attendance } = useEventDetailsContext()
  const { event } = useEventDetailsContext()

  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <_AttendancePage attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      extras: null,
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
const _AttendancePage: FC<EventAttendanceProps> = ({ attendance }) => {
  const { pools } = usePoolsGetQuery(attendance.id)

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
    pools,
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
        <InfoBox pools={pools || []} />
      </Box>
      <Box>
        <PoolsForm />
        <PoolBox pools={pools || []} attendanceId={attendance.id} />
      </Box>
    </Box>
  )
}
