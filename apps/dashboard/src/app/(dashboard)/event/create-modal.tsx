import { Modal } from "@mantine/core"
import { FC } from "react"
import { useEventWriteForm } from "./write-form"
import { useCreateEventMutation } from "../../../modules/event/use-create-event-mutation"

export type EventCreationModalProps = {
  close: () => void
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close }) => {
  const create = useCreateEventMutation()
  const FormComponent = useEventWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      <FormComponent />
    </Modal>
  )
}
