import type { OfflineWrite } from "@dotkomonline/types"
import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { useS3UploadFile } from "../use-s3-upload-file"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateOfflineMutation()
  const upload = useS3UploadFile()

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      const toSave: OfflineWrite = {
        title: data.title,
        published: data.published,
        id: data.id,
        fileUrl: data.fileUrl,
        imageUrl: data.imageUrl,
      }

      create.mutate({
        ...toSave,
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
