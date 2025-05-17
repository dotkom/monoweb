import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useMarkWriteForm } from "src/app/(dashboard)/mark/write-form"
import { useCreateMarkMutation } from "../mutations/use-create-mark-mutation"

export const CreateMarkModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateMarkMutation()
  const FormComponent = useMarkWriteForm({
    onSubmit: (data) => {
      create.mutate(data)  
      close()
    },
  })
  return <FormComponent />
}

export const useCreateMarkModal = () => () =>
  modals.openContextModal({
    modal: "mark/create",
    title: "Opprett ny prikk",
    innerProps: {},
  })
