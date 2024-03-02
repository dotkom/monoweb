import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useCreateInterestGroupMutation } from "../mutations/use-create-interest-group-mutation"
import { useInterestGroupWriteForm } from "src/app/(dashboard)/interest-group/write-form"

export const CreateInterestGroupModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateInterestGroupMutation()
  const FormComponent = useInterestGroupWriteForm({
    onSubmit: (data) => {
      console.log("data")
      create.mutate({
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateInterestGroupModal = () => () => {
  return modals.openContextModal({
    modal: "interestGroup/create",
    title: "Create new interest group",
    innerProps: {},
  })
}
