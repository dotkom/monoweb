import { Modal } from "@mantine/core"
import { FC } from "react"

import { Committee, EventWrite } from "@dotkomonline/types"
import { trpc } from "../../trpc"
import { useEventWriteForm } from "./EventWriteForm"

export type EventCreationModalProps = {
  close: () => void
  committees: Committee[]
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close, committees }) => {
  const utils = trpc.useContext()
  const create = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const onFormSubmit = (data: EventWrite) => {
    create.mutate(data)
    close()
  }
  const FormComponent = useEventWriteForm(onFormSubmit, {
    description: null,
    subtitle: null,
    imageUrl: null,
    location: null,
    committeeId: null,
    start: new Date(),
    end: new Date(),
  })
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      <FormComponent committees={committees} />
    </Modal>
  )
}
