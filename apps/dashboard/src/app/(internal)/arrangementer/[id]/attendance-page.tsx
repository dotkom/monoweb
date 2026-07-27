import type { Attendance } from "@dotkomonline/rpc/attendance"
import { Box, Checkbox, Divider, Stack, Title } from "@mantine/core"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import type { FC } from "react"
import { useAttendanceForm } from "../components/attendance-form"
import { PoolBox } from "../components/pools-box"
import { usePoolsForm } from "../components/pools-form"
import { useAddAttendanceMutation, useUpdateAttendanceMutation, useUpdateEventMutation } from "../mutations"
import { useEventContext } from "./provider"

export const AttendancePage: FC = () => {
  const { event, attendance } = useEventContext()
  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <AttendancePageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const { canEdit } = useEventEditPermission()
  const mutation = useAddAttendanceMutation()
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: new Date(),
      registerEnd: new Date(),
      deregisterDeadline: new Date(),
      selections: [],
    },
    label: "Opprett",
    disabled: !canEdit,
    onSubmit: (values) => {
      mutation.mutate({ eventId, values })
    },
  })

  return (
    <Stack gap="md">
      <Title order={5}>Lag påmelding</Title>
      <Box mb="md">
        <MarkForMissedAttendanceCheckbox />
      </Box>
      <AttendanceForm />
    </Stack>
  )
}

interface AttendancePageDetailProps {
  attendance: Attendance
}

const AttendancePageDetail = ({ attendance }: AttendancePageDetailProps) => {
  const { canEdit } = useEventEditPermission()
  const updateAttendanceMut = useUpdateAttendanceMutation()

  const AttendanceForm = useAttendanceForm({
    defaultValues: attendance,
    label: "Oppdater",
    disabled: !canEdit,
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
    disabled: !canEdit,
  })

  return (
    <Box>
      <Box>
        <Title mb={10} order={3}>
          Påmeldingstid
        </Title>
        <Box mb="md">
          <MarkForMissedAttendanceCheckbox />
        </Box>
        <AttendanceForm />
      </Box>
      <Divider my={32} />
      <Box>
        <Title order={3}>Påmeldingsgrupper</Title>
        <PoolBox attendance={attendance} canEdit={canEdit} />
        <PoolsForm />
      </Box>
    </Box>
  )
}

function MarkForMissedAttendanceCheckbox() {
  const { event, attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const updateEvent = useUpdateEventMutation()

  return (
    <Checkbox
      label="Gi prikk for fravær"
      description="Deltakere som ikke møter får automatisk prikk"
      checked={event.markForMissedAttendance}
      disabled={attendance === null || !canEdit || updateEvent.isPending}
      onChange={(changeEvent) => {
        updateEvent.mutate({
          id: event.id,
          event: {
            status: event.status,
            type: event.type,
            title: event.title,
            start: event.start,
            end: event.end,
            description: event.description,
            imageUrl: event.imageUrl,
            locationTitle: event.locationTitle,
            locationAddress: event.locationAddress,
            locationLink: event.locationLink,
            markForMissedAttendance: changeEvent.currentTarget.checked,
            contestId: event.contestId,
          },
          groupIds: event.hostingGroups.map((group) => group.slug),
          companyIds: event.companies.map((company) => company.id),
          parentId: event.parentId,
        })
      }}
    />
  )
}
