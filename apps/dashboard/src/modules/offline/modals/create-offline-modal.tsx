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

  const FormComponent = useOfflineWriteForm({
    onSubmit: async (data) => {
      console.log("submitting", data)
      let file = null
      if (data.file !== undefined) {
        file = await upload(data.file)
      }

      let image = null
      if (data.image !== undefined) {
        image = await upload(data.image)
      }

      const toSave: OfflineWrite = {
        title: data.title,
        published: data.published,
        id: data.id,
        file,
        image,
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
