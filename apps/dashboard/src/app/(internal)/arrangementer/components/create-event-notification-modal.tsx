"use client"

import { useNotificationWriteForm } from "@/app/(internal)/varslinger/write-form"
import { useTRPC } from "@/lib/trpc-client"
import type { AttendanceId } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useQuery } from "@tanstack/react-query"
import { skipToken } from "@tanstack/react-query"
import type { FC } from "react"
import { useCreateEventNotificationMutation } from "../mutations"

interface CreateEventNotificationModalProps {
  eventId: string
  eventPath: string
  attendanceId: AttendanceId | undefined
}

export const CreateEventNotificationModal: FC<ContextModalProps<CreateEventNotificationModalProps>> = ({
  context,
  id,
  innerProps: { eventId, eventPath, attendanceId },
}) => {
  const close = () => context.closeModal(id)
  const create = useCreateEventNotificationMutation(eventId)
  const trpc = useTRPC()

  const { data: attendeeUserIds = [] } = useQuery(
    trpc.event.attendance.getAttendeeUserIds.queryOptions(attendanceId ?? skipToken)
  )
  const FormComponent = useNotificationWriteForm({
    defaultValues: {
      recipientIds: [],
      taskId: null,
      payloadType: "EVENT",
      payload: eventPath,
      actorGroupId: null,
    },
    onSubmit: (data) => {
      create.mutate({ ...data, recipientIds: attendeeUserIds })
      close()
    },
  })

  return <FormComponent />
}

export const openCreateEventNotificationModal =
  ({ eventId, eventPath, attendanceId }: CreateEventNotificationModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/notification/create",
      title: "Legg inn ny varsling",
      size: "lg",
      innerProps: { eventId, eventPath, attendanceId },
    })
