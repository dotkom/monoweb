import { type FC } from "react"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useS3UploadFile } from "../use-s3-upload-file"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateOfflineMutation()
  const upload = useS3UploadFile()

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      if (data.file === undefined) {
        return
      }

      const fileToStore = await upload(data.file)
      create.mutate({
        ...data,
        file: fileToStore,
      })
      close()
    },
  })
  return <FormComponent />
}

export const useCreateOfflineModal = () => () =>
  modals.openContextModal({
    modal: "offline/create",
    title: "Opprett ny Offline",
    innerProps: {},
  })
