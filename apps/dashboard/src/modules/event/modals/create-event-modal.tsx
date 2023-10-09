import { EventWriteSchema } from "@dotkomonline/types"
import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useEventWriteForm } from "../../../app/(dashboard)/event/write-form"
import { useCreateEventMutation } from "../mutations/use-create-event-mutation"

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
      innerProps: {},
    })
}
