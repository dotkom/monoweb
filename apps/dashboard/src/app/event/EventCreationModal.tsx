import { Modal } from "@mantine/core"
import { FC } from "react"

import { trpc } from "../../trpc"
import { useEventWriteForm } from "./Form"

export type EventCreationModalProps = {
  close: () => void
}

export const EventCreationModal: FC<EventCreationModalProps> = ({ close }) => {
  const utils = trpc.useContext()
  const create = trpc.event.create.useMutation({
    onSuccess: () => {
      utils.event.all.invalidate()
    },
  })
  const FormComponent = useEventWriteForm((data) => {
    create.mutate(data)
    close()
  })
  return (
    <Modal centered title="Opprett nytt arrangement" opened onClose={close}>
      {FormComponent}
    </Modal>
  )
}
