import { type Attendance } from "@dotkomonline/types"
import { Box, Divider, Text, Title } from "@mantine/core"
import { type FC } from "react"
import { useAttendanceForm } from "../../../../modules/attendance/components/attendance-page/AttendanceForm"
import { InfoBox } from "../../../../modules/attendance/components/attendance-page/InfoBox"
import { usePoolsForm } from "../../../../modules/attendance/components/attendance-page/PoolsForm"
import { useEventAttendanceGetQuery } from "../../../../modules/attendance/queries/use-event-attendance-get-query"
import { trpc } from "../../../../utils/trpc"
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
  const mutation = trpc.event.addAttendance.useMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      mergeTime: new Date(),
      deregisterDeadline: new Date(),
    },
    label: "Opprett",
    onSubmit: (values) => {
      mutation.mutate({ eventId, obj: values })
    },
  })

  return (
    <Box>
      <Title order={5}>Ingen påmelding</Title>
      <AttendanceForm />
    </Box>
  )
}

interface EventAttendanceProps {
  attendance: Attendance
}
const _AttendancePage: FC<EventAttendanceProps> = ({ attendance }) => {
  const { pools } = useEventAttendanceGetQuery(attendance.id)

  const updateAttendance = trpc.event.attendance.updateAttendance.useMutation()

  const AttendanceForm = useAttendanceForm({
    defaultValues: attendance,
    label: "Oppdater",
    onSubmit: (values) => {
      updateAttendance.mutate({
        id: attendance.id,
        attendance: {
          registerStart: values.registerStart,
          registerEnd: values.registerEnd,
          mergeTime: values.mergeTime,
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
      </Box>
    </Box>
  )
}
