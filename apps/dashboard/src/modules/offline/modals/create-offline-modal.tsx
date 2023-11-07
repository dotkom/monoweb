import { type FC } from "react"
import { type ContextModalProps, modals } from "@mantine/modals"
import { type OfflineWrite } from "@dotkomonline/types"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useS3UploadFile } from "../use-s3-upload-file"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateOfflineMutation()
  const upload = useS3UploadFile()

  const handleUpload = async (file?: File) => (file?.name ? await upload(file) : null)

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      // Only upload if files are present
      const fileUrl = await handleUpload(data.file)
      const imageUrl = await handleUpload(data.image)

      const toSave: OfflineWrite = {
        title: data.title,
        published: data.published,
        id: data.id,
        fileUrl,
        imageUrl,
      }

      console.log(toSave)

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
