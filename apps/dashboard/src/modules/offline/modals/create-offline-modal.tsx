import { FC } from "react"
import { ContextModalProps, modals } from "@mantine/modals"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateOfflineMutation()
  const FormComponent = useOfflineWriteForm({
    onSubmit: (data) => {
      create.mutate(data)
      close()
    },
  })
  return <FormComponent />
}

export const useCreateOfflineModal = () => {
  return () =>
    modals.openContextModal({
      modal: "offline/create",
      title: "Opprett ny Offline",
      innerProps: {},
    })
}
