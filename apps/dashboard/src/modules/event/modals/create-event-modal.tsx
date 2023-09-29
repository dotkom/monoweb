import { FC } from "react"
import { useCreateEventMutation } from "../mutations/use-create-event-mutation"
import { useEventWriteForm } from "../../../app/(dashboard)/event/write-form"
import { ContextModalProps, modals } from "@mantine/modals"

export const CreateEventModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateEventMutation()
  const FormComponent = useEventWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}

export const useCreateEventModal = () => {
  return () =>
    modals.openContextModal({
      modal: "event/create",
      title: "Opprett nytt arrangement",
    })
}
