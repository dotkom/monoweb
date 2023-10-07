import { FC } from "react"
import { useCreateCompanyMutation } from "../mutations/use-create-company-mutation"
import { ContextModalProps, modals } from "@mantine/modals"
import { useCompanyWriteForm } from "src/app/(dashboard)/company/write-form"

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
      title: "Opprett ny bedrift",
      innerProps: {},
    })
}
