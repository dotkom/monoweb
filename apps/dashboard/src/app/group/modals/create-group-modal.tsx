import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useCreateGroupMutation } from "../mutations/use-create-group-mutation"
import { useGroupWriteForm } from "../write-form"

export const CreateGroupModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateGroupMutation()
  const FormComponent = useGroupWriteForm({
    onSubmit: (data) => {
      create.mutate({
        ...data,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateGroupModal = () => () => {
  return modals.openContextModal({
    modal: "group/create",
    title: "Lag en ny gruppe",
    innerProps: {},
  })
}
