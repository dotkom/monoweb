import { type FC } from "react"
import { type ContextModalProps, modals } from "@mantine/modals"
import { type OfflineWrite } from "@dotkomonline/types"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { type File } from "../../../../stubs/file/File"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useS3UploadFile } from "../use-s3-upload-file"
import { useQueryNotification } from "../../../app/notifications"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const create = useCreateOfflineMutation()
  const upload = useS3UploadFile()
  const notification = useQueryNotification()

  const handleUpload = async (file?: File) => (file?.name ? await upload(file) : null)

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      let fileUrl = null
      let imageUrl = null

      try {
        fileUrl = await handleUpload(data.file)
      } catch (e) {
        notification.fail({
          title: "Feil",
          message: "Kunne ikke laste opp fil. ",
        })
      }

      try {
        imageUrl = await handleUpload(data.image)
      } catch (e) {
        notification.fail({
          message: "Kunne ikke laste opp bilde",
          title: "Feil",
        })
      }

      const toSave: OfflineWrite = {
        title: data.title,
        published: data.published,
        id: data.id,
        fileUrl,
        imageUrl,
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
