"use client"

import { useNotificationWriteForm } from "@/app/(internal)/varslinger/write-form"
import { useTRPC } from "@/lib/trpc-client"
import type { AttendanceId } from "@dotkomonline/rpc/attendance"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useQuery } from "@tanstack/react-query"
import { skipToken } from "@tanstack/react-query"
import type { FC } from "react"
import { useCreateEventNotificationMutation } from "../mutations"

interface CreateEventNotificationModalProps {
  eventPath: string
  attendanceId: AttendanceId | undefined
}

export const CreateEventNotificationModal: FC<ContextModalProps<CreateEventNotificationModalProps>> = ({
  context,
  id,
  innerProps: { eventPath, attendanceId },
}) => {
  const close = () => context.closeModal(id)
  const create = useCreateEventNotificationMutation(eventPath)
  const trpc = useTRPC()

  const { data: attendeeUserIds = [], isLoading: isLoadingAttendees } = useQuery(
    trpc.event.attendance.getAttendeeUserIds.queryOptions(attendanceId ?? skipToken)
  )

  const isWaitingForAttendees = attendanceId !== undefined && isLoadingAttendees

  const FormComponent = useNotificationWriteForm({
    defaultValues: {
      recipientIds: [],
      taskId: null,
      payloadType: "EVENT",
      payload: eventPath,
      actorGroupId: null,
    },
    disabled: isWaitingForAttendees,
    onSubmit: (data) => {
      create.mutate(
        { ...data, recipientIds: attendeeUserIds },
        {
          onSuccess: () => {
            close()
          },
        }
      )
    },
  })

  return <FormComponent />
}

export const openCreateEventNotificationModal =
  ({ eventId, eventPath, attendanceId }: { eventId: string; eventPath: string; attendanceId: AttendanceId | undefined }) =>
  () =>
    modals.openContextModal({
      modal: "event/notification/create",
      title: "Legg inn ny varsling",
      size: "lg",
      innerProps: { eventPath, attendanceId },
    })
