import { FC } from "react"
import { ContextModalProps, modals } from "@mantine/modals"
import { useCompanyWriteForm } from "../write-form"
import { useCreateCompanyMutation } from "../mutations/use-create-company-mutation"

export const CreateCompanyModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateCompanyMutation()
  const FormComponent = useCompanyWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}

export const useCreateCompanyModal = () => {
  return () =>
    modals.openContextModal({
      modal: "company/create",
      title: "Registrer ny bedrift",
      innerProps: {},
    })
}
