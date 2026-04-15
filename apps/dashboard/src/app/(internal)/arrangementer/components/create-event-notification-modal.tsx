import { useNotificationWriteForm } from "@/app/(internal)/varslinger/write-form"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateEventNotificationMutation } from "../mutations"

interface CreateEventNotificationModalProps {
  eventId: string
}

export const CreateEventNotificationModal: FC<ContextModalProps<CreateEventNotificationModalProps>> = ({
  context,
  id,
  innerProps: { eventId },
}) => {
  const close = () => context.closeModal(id)
  const create = useCreateEventNotificationMutation(eventId)

  const FormComponent = useNotificationWriteForm({
    defaultValues: {
      recipientIds: [],
      taskId: null,
      payloadType: "EVENT",
      payload: eventId,
    },
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })

  return <FormComponent />
}

export const openCreateEventNotificationModal =
  ({ eventId }: CreateEventNotificationModalProps) =>
  () =>
    modals.openContextModal({
      modal: "event/notification/create",
      title: "Legg inn ny varsling",
      size: "lg",
      innerProps: { eventId },
    })
