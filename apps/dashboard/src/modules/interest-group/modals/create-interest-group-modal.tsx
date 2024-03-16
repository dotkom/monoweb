import { ContextModalProps, modals } from "@mantine/modals"
import { FC } from "react"
import { useCreateInterestGroupMutation } from "../mutations/use-create-interest-group-mutation"
import { useInterestGroupWriteForm } from "src/app/(dashboard)/interest-group/write-form"

export const CreateInterestGroupModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateInterestGroupMutation()
  const FormComponent = useInterestGroupWriteForm({
    onSubmit: (data) => {
      create.mutate({
        ...data,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateInterestGroupModal = () => () => {
  return modals.openContextModal({
    modal: "interestGroup/create",
    title: "Lag en ny interessegruppe",
    innerProps: {},
  })
}
