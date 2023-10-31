import { type ContextModalProps, modals } from "@mantine/modals"
import { type FC } from "react"
import { useCompanyWriteForm } from "src/app/(dashboard)/company/write-form"
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

export const useCreateCompanyModal = () => () =>
  modals.openContextModal({
    modal: "company/create",
    title: "Registrer ny bedrift",
    innerProps: {},
  })
