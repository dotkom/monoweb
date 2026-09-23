"use client"

import { PermissionTooltip } from "@/components/PermissionTooltip"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import { Button, Checkbox, Field, FieldContent, FieldDescription, FieldLabel, Title } from "@dotkomonline/ui"
import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { useEventContext } from "../provider"
import {
  useAddAttendanceMutation,
  useDeleteAttendanceMutation,
  useUpdateAttendanceMutation,
  useUpdateEventMutation,
} from "../../mutations"
import { useEventEditPermission } from "../../use-event-edit-permission"
import { AttendanceWriteForm, EventScheduleSummary } from "./components/AttendanceForm"
import { PoolBox } from "./components/PoolsBox"
import { PoolsFormSection } from "./components/PoolsForm"
import { getDefaultAttendanceDates } from "./components/attendance-dates"

export default function EventAttendancePage() {
  const { event, attendance } = useEventContext()
  if (!attendance) {
    return <NoAttendanceFallback eventId={event.id} />
  }

  return <AttendancePageDetail attendance={attendance} />
}

const NoAttendanceFallback = ({ eventId }: { eventId: string }) => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const mutation = useAddAttendanceMutation()
  const defaultAttendanceDates = getDefaultAttendanceDates(event.start)

  return (
    <div className="flex flex-col gap-4">
      <Title className="text-base font-medium">Lag påmelding</Title>
      <MarkForMissedAttendanceCheckbox />
      <EventScheduleSummary eventStart={event.start} eventEnd={event.end} />
      <AttendanceWriteForm
        defaultValues={{
          registerStart: defaultAttendanceDates.registerStart,
          registerEnd: defaultAttendanceDates.registerEnd,
          deregisterDeadline: defaultAttendanceDates.deregisterDeadline,
          selections: [],
        }}
        submitLabel="Opprett"
        disabled={!canEdit}
        eventStart={event.start}
        onSubmit={(values) => {
          mutation.mutate({ eventId, values })
        }}
      />
    </div>
  )
}

interface AttendancePageDetailProps {
  attendance: Attendance
}

const AttendancePageDetail = ({ attendance }: AttendancePageDetailProps) => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const updateAttendanceMut = useUpdateAttendanceMutation()

  return (
    <div>
      <div>
        <Title className="mb-2 text-xl">Påmeldingstid</Title>
        <div className="mb-4">
          <MarkForMissedAttendanceCheckbox />
        </div>
        <div className="mb-4">
          <EventScheduleSummary eventStart={event.start} eventEnd={event.end} />
        </div>
        <AttendanceWriteForm
          defaultValues={attendance}
          submitLabel="Oppdater"
          disabled={!canEdit}
          eventStart={event.start}
          onSubmit={(values) => {
            updateAttendanceMut.mutate({
              id: attendance.id,
              attendance: {
                registerStart: values.registerStart,
                registerEnd: values.registerEnd,
                deregisterDeadline: values.deregisterDeadline,
              },
            })
          }}
        />
        <div className="mt-4">
          <AttendanceDeleteButton attendance={attendance} />
        </div>
      </div>
      <hr className="my-8" />
      <div>
        <Title className="text-xl">Påmeldingsgrupper</Title>
        <PoolBox attendance={attendance} canEdit={canEdit} />
        <PoolsFormSection attendanceId={attendance.id} disabled={!canEdit} />
      </div>
    </div>
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
  const [open, setOpen] = useState(false)

  return (
    <>
      <PermissionTooltip allowed={canDeleteAttendance} label={deleteDisabledReason ?? undefined}>
        <Button
          variant="destructive"
          disabled={!canDeleteAttendance || deleteAttendance.isPending}
          onClick={() => setOpen(true)}
          icon={<IconTrash className="size-3.5" />}
        >
          Slett påmelding
        </Button>
      </PermissionTooltip>
      <ConfirmDeleteModal
        open={open}
        onOpenChange={setOpen}
        title="Slett påmelding"
        description="Er du sikker på at du vil slette påmeldingen?"
        onConfirm={() => {
          deleteAttendance.mutate({ id: attendance.id })
          setOpen(false)
        }}
      />
    </>
  )
}

function MarkForMissedAttendanceCheckbox() {
  const { event, attendance } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const updateEvent = useUpdateEventMutation()

  return (
    <Field orientation="horizontal">
      <Checkbox
        id="markForMissedAttendance"
        checked={event.markForMissedAttendance}
        disabled={attendance === null || !canEdit || updateEvent.isPending}
        onCheckedChange={(checked) => {
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
              markForMissedAttendance: checked === true,
              contestId: event.contestId,
            },
            groupIds: event.hostingGroups.map((group) => group.slug),
            companyIds: event.companies.map((company) => company.id),
            parentId: event.parentId,
          })
        }}
      />
      <FieldContent>
        <FieldLabel htmlFor="markForMissedAttendance">Gi prikk for fravær</FieldLabel>
        <FieldDescription>Deltakere som ikke møter får automatisk prikk</FieldDescription>
      </FieldContent>
    </Field>
  )
}
