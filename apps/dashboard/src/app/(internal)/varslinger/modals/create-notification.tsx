import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateNotificationMutation } from "../mutations"
import { useNotificationWriteForm } from "../write-form"

export const CreateNotificationModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateNotificationMutation()
  const FormComponent = useNotificationWriteForm({
    onSubmit: (data) => {
      create.mutate(data), close()
    },
  })
  return <FormComponent />
}

export const useCreateNotificationModal = () => () =>
  modals.openContextModal({
    modal: "notification/create",
    title: "Legg inn ny varsling",
    size: "lg",
    innerProps: {},
  })
