import { type ContextModalProps, modals } from "@mantine/modals"
import type { FC } from "react"
import type { File } from "../../../../stubs/file/File"
import { useOfflineWriteForm } from "../../../app/(dashboard)/offline/write-form"
import { useQueryNotification } from "../../../app/notifications"
import { useCreateOfflineMutation } from "../mutations/use-create-offline-mutation"
import { useS3UploadFile, useStaticAssetCreate } from "../use-s3-upload-file"

export const CreateOfflineModal: FC<ContextModalProps> = ({ context, id }) => {
  const close = () => context.closeModal(id)
  const createOffline = useCreateOfflineMutation()
  const upload = useS3UploadFile()
  const saveStaticAsset = useStaticAssetCreate()
  const notification = useQueryNotification()

  const handleUpload = async (file?: File) => {
    if (!file?.name) {
      return null
    }

    const result = await upload(file)
    const inserted = await saveStaticAsset(result)

    return inserted
  }

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      let fileId: string | undefined = undefined
      let imageId: string | undefined = undefined

      try {
        const uploadedFile = await handleUpload(data.file)
        if (!uploadedFile) {
          notification.fail({
            title: "Feil",
            message: "Kunne ikke laste opp pdf. ",
          })
          return
        }
        fileId = uploadedFile.id
      } catch (e) {
        notification.fail({
          title: "Feil",
          message: "Kunne ikke laste opp pdf. ",
        })
      }

      try {
        const image = await handleUpload(data.image)
        if (!image) {
          notification.fail({
            title: "Feil",
            message: "Kunne ikke laste opp bilde",
          })
          return
        }
        imageId = image.id
      } catch (e) {
        notification.fail({
          message: "Kunne ikke laste opp bilde",
          title: "Feil",
        })
      }

      if (!fileId || !imageId) {
        console.error("Reached invalid state - there is a bug in this logic.")
        return
      }

      createOffline.mutate({
        fileId,
        imageId,
        title: data.title,
        published: data.published,
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
