import { type FC } from "react"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useCreateEventMutation } from "../mutations/use-create-event-mutation"
import { useEventWriteForm } from "../../../app/(dashboard)/event/write-form"

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

export const useCreateEventModal = () => () =>
    modals.openContextModal({
      modal: "event/create",
      title: "Opprett nytt arrangement",
      innerProps: {},
    })
