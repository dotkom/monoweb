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

  const handleUpload = async (file: File) => {
    // if (!file?.name) {
    //   return null
    // }

    console.log("Uploading file: ", file)
    const result = await upload(file)
    console.log("Uploaded file: ", result)
    const resourceUrl = `https://s3.eu-north-1.amazonaws.com/cdn.staging.online.ntnu.no/offlines/${result.fileName}`
    const inserted = await saveStaticAsset({
      url: resourceUrl,
      fileName: result.fileName,
      fileType: result.fileType,
    })
    console.log("Inserted file: ", inserted)

    return inserted
  }

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      let fileId: string | undefined = undefined
      let imageId: string | undefined = undefined

      console.log("Trying to upload data: ", data)

      try {
        console.log("Uploading file: ", data.file)
        const uploadedFile = await handleUpload(data.file)
        console.log("Uploaded file: ", uploadedFile)
        if (!uploadedFile) {
          notification.fail({
            title: "Feil",
            message: "Kunne ikke laste opp pdf. ",
          })
          return
        }
        fileId = uploadedFile.id
      } catch (e) {
        console.error("Failed to upload file: ", e)
        notification.fail({
          title: "Feil",
          message: "Kunne ikke laste opp pdf. ",
        })
      }

      try {
        console.log("Uploading image: ", data.image)
        const image = await handleUpload(data.image)
        console.log("Uploaded image: ", image)
        if (!image) {
          notification.fail({
            title: "Feil",
            message: "Kunne ikke laste opp bilde",
          })
          return
        }
        imageId = image.id
      } catch (e) {
        console.error("Failed to upload image: ", e)
        notification.fail({
          message: "Kunne ikke laste opp bilde",
          title: "Feil",
        })
      }

      if (!fileId || !imageId) {
        console.error("Reached invalid state - there is a bug in this logic.")
        return
      }

      console.log("Creating offline with fileId: ", fileId, " and imageId: ", imageId)
      createOffline.mutate({
        fileId,
        imageId,
        title: data.title,
        published: data.published,
      })
      console.log("Created offline")
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
