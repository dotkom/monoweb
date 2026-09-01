import type { Attendance } from "@dotkomonline/rpc/attendance"
import { Box, Button, Checkbox, Divider, Stack, Title } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { PermissionTooltip } from "@/components/PermissionTooltip"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import type { FC } from "react"
import { EventScheduleSummary, useAttendanceForm } from "../components/attendance-form"
import { getDefaultAttendanceDates } from "../components/attendance-dates"
import { PoolBox } from "../components/pools-box"
import { usePoolsForm } from "../components/pools-form"
import {
  useAddAttendanceMutation,
  useDeleteAttendanceMutation,
  useUpdateAttendanceMutation,
  useUpdateEventMutation,
} from "../mutations"
import { useEventContext } from "./provider"

export const AttendancePage: FC = () => {
  const { event, attendance } = useEventContext()
  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <AttendancePageDetail attendance={attendance} />
}

const NoAttendanceFallback: FC<{ eventId: string }> = ({ eventId }) => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const mutation = useAddAttendanceMutation()
  const defaultAttendanceDates = getDefaultAttendanceDates(event.start)
  const AttendanceForm = useAttendanceForm({
    defaultValues: {
      registerStart: defaultAttendanceDates.registerStart,
      registerEnd: defaultAttendanceDates.registerEnd,
      deregisterDeadline: defaultAttendanceDates.deregisterDeadline,
      selections: [],
    },
    label: "Opprett",
    disabled: !canEdit,
    eventStart: event.start,
    onSubmit: (values) => {
      mutation.mutate({ eventId, values })
    },
  })

  return (
    <Stack gap="md">
      <Title order={5}>Lag påmelding</Title>
      <Box>
        <MarkForMissedAttendanceCheckbox />
      </Box>
      <EventScheduleSummary eventStart={event.start} eventEnd={event.end} />
      <AttendanceForm />
    </Stack>
  )
}

interface AttendancePageDetailProps {
  attendance: Attendance
}

const AttendancePageDetail = ({ attendance }: AttendancePageDetailProps) => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const updateAttendanceMut = useUpdateAttendanceMutation()

  const AttendanceForm = useAttendanceForm({
    defaultValues: attendance,
    label: "Oppdater",
    disabled: !canEdit,
    eventStart: event.start,
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
        <Box mb="md">
          <EventScheduleSummary eventStart={event.start} eventEnd={event.end} />
        </Box>
        <AttendanceForm />
        <Box mt="md">
          <AttendanceDeleteButton attendance={attendance} />
        </Box>
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

function getAttendanceDeleteDisabledReason(canEdit: boolean, hasPools: boolean): string | null {
  if (!canEdit) {
    return "Du har ikke redigeringstilgang til dette"
  }

  if (hasPools) {
    return "Påmeldingen har påmeldingsgrupper og kan derfor ikke slettes"
  }

  return null
}

function AttendanceDeleteButton({ attendance }: { attendance: Attendance }) {
  const { canEdit } = useEventEditPermission()
  const deleteAttendance = useDeleteAttendanceMutation()
  const hasPools = attendance.pools.length > 0
  const deleteDisabledReason = getAttendanceDeleteDisabledReason(canEdit, hasPools)
  const canDeleteAttendance = deleteDisabledReason === null

  const openDeleteModal = useConfirmDeleteModal({
    title: "Slett påmelding",
    text: "Er du sikker på at du vil slette påmeldingen?",
    onConfirm: () => {
      deleteAttendance.mutate({ id: attendance.id })
    },
  })

  return (
    <PermissionTooltip allowed={canDeleteAttendance} label={deleteDisabledReason ?? undefined}>
      <Button
        color="red"
        variant="light"
        disabled={!canDeleteAttendance || deleteAttendance.isPending}
        onClick={openDeleteModal}
        leftSection={<IconTrash height={14} width={14} />}
      >
        Slett påmelding
      </Button>
    </PermissionTooltip>
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
